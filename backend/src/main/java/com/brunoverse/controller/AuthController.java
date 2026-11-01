package com.brunoverse.controller;

import com.brunoverse.config.CurrentUser;
import com.brunoverse.model.AppUser;
import com.brunoverse.repository.UserRepository;
import com.brunoverse.service.PolicyService;
import com.brunoverse.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Set<String> ROLES = Set.of("owner", "rescuer", "feeder", "vet", "ngo");

    private final UserRepository users;
    private final TokenService tokens;
    private final PolicyService policy;

    public AuthController(UserRepository users, TokenService tokens, PolicyService policy) {
        this.users = users;
        this.tokens = tokens;
        this.policy = policy;
    }

    /** Log in with email or phone + password. Body: {"id": "...", "password": "..."} */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String id = body.getOrDefault("id", "").trim();
        String password = body.getOrDefault("password", "");
        Optional<AppUser> user = users.findByEmailIgnoreCase(id);
        if (user.isEmpty()) {
            String phone = lastTenDigits(id);
            user = phone.length() < 10 ? Optional.empty() : users.findAll().stream()
                    .filter(u -> phone.equals(lastTenDigits(u.phone)))
                    .findFirst();
        }
        if (user.isEmpty() || !user.get().checkPassword(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Email/phone or password is incorrect"));
        }
        return ResponseEntity.ok(session(user.get()));
    }

    /** Create an account (owner, rescuer, feeder, vet or ngo). */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AppUser user) {
        if (blank(user.email) || blank(user.password) || blank(user.name) || blank(user.phone)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, phone, email and password are required"));
        }
        if (user.password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        }
        if (users.findByEmailIgnoreCase(user.email.trim()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "An account with this email already exists"));
        }
        user.email = user.email.trim();
        if (user.id == null || users.existsById(user.id)) user.id = "u_" + UUID.randomUUID().toString().substring(0, 12);
        if (!ROLES.contains(user.role)) user.role = "owner";
        user.verified = false;
        user.joined = System.currentTimeMillis();
        if (user.available == null) user.available = true;
        if (user.baseCompleted == null) user.baseCompleted = 0;
        if (user.baseHelped == null) user.baseHelped = 0;
        user.dLat = null;
        user.dLng = null;
        users.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(session(user));
    }

    /** Who am I? Used to check a saved login when the app opens. */
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest req) {
        AppUser u = policy.user(CurrentUser.id(req));
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please log in again"));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("user", policy.publicView(u, u));
        out.put("admin", policy.isAdmin(u));
        return ResponseEntity.ok(out);
    }

    private Map<String, Object> session(AppUser u) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("token", tokens.issue(u.id));
        out.put("user", policy.publicView(u, u));
        out.put("admin", policy.isAdmin(u));
        return out;
    }

    /** "+91 98765 43210", "09876543210" and "9876543210" all match. */
    private static String lastTenDigits(String s) {
        String d = s == null ? "" : s.replaceAll("\\D", "");
        return d.length() > 10 ? d.substring(d.length() - 10) : d;
    }

    private static boolean blank(String s) {
        return s == null || s.isBlank();
    }
}
