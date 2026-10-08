package com.brunoverse.controller;

import com.brunoverse.config.JwtUtil;
import com.brunoverse.dto.ErrorResponse;
import com.brunoverse.dto.LoginRequest;
import com.brunoverse.dto.LoginResponse;
import com.brunoverse.dto.RegisterRequest;
import com.brunoverse.entity.User;
import com.brunoverse.enums.UserRole;
import com.brunoverse.repository.UserRepository;
import com.brunoverse.service.GoogleAuthException;
import com.brunoverse.service.GoogleAuthService;
import com.brunoverse.service.GoogleUserInfo;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleAuthService googleAuthService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          GoogleAuthService googleAuthService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "EMAIL_EXISTS", "message", "Email is already registered"));
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new LoginResponse(
                        "Registration successful",
                        savedUser.getId(),
                        savedUser.getName(),
                        savedUser.getEmail(),
                        savedUser.getRole(),
                        token,
                        savedUser.getAvatarUrl(),
                        savedUser.getGender(),
                        savedUser.getAddress(),
                        savedUser.getBio()
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "INVALID_CREDENTIALS", "message", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(
                new LoginResponse(
                        "Login successful",
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        token,
                        user.getAvatarUrl(),
                        user.getGender(),
                        user.getAddress(),
                        user.getBio()
                )
        );
    }

    /**
     * Google Identity Services (GIS) endpoint.
     * Receives OIDC ID Token from frontend (credential).
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, Object> body) {
        String onboardingToken = (String) body.get("onboardingToken");
        if (onboardingToken != null && !onboardingToken.isBlank()) {
            if (jwtUtil.validateToken(onboardingToken)) {
                String verifiedEmail = jwtUtil.extractEmail(onboardingToken);
                String name = (String) body.get("name");
                String picture = (String) body.get("picture");
                GoogleUserInfo userInfo = new GoogleUserInfo(verifiedEmail, true, name, picture, "sub", "", "", System.currentTimeMillis() / 1000L + 3600);
                return processAuthenticatedGoogleUser(userInfo, body);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        new ErrorResponse("EXPIRED_ONBOARDING", "Onboarding session expired", "Onboarding session expired. Please sign in with Google again.")
                );
            }
        }

        String credential = (String) body.get("credential");
        if (credential == null || credential.isBlank()) {
            return ResponseEntity.badRequest().body(
                    new ErrorResponse("MISSING_CREDENTIAL", "Google token verification failed", "Google credential / ID token is required")
            );
        }

        GoogleUserInfo userInfo;
        try {
            logger.info("Attempting Google ID token verification...");
            userInfo = googleAuthService.verifyIdToken(credential);
            logger.info("Google ID token verified successfully: email={}, name={}", userInfo.getEmail(), userInfo.getName());
        } catch (GoogleAuthException e) {
            logger.error("Google authentication failed [{}]: {} - {}", e.getErrorCode(), e.getMessage(), e.getDetails());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ErrorResponse(e.getErrorCode(), e.getMessage(), e.getDetails())
            );
        } catch (Exception e) {
            logger.error("Unexpected error verifying Google token: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("SERVER_ERROR", "Google verification failed", "Internal verification error: " + e.getMessage())
            );
        }

        return processAuthenticatedGoogleUser(userInfo, body);
    }

    /**
     * Google OAuth 2.0 Authorization Code callback endpoint.
     */
    @PostMapping("/google/callback")
    public ResponseEntity<?> handleGoogleCallback(@RequestBody Map<String, Object> payload) {
        String code = (String) payload.get("code");
        String redirectUri = (String) payload.get("redirectUri");

        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(
                    new ErrorResponse("MISSING_CODE", "Google authorization failed", "Authorization code is required")
            );
        }

        GoogleUserInfo userInfo;
        try {
            logger.info("Attempting Google authorization code exchange...");
            userInfo = googleAuthService.exchangeCodeForUserInfo(code, redirectUri);
            logger.info("Google code exchange successful: email={}, name={}", userInfo.getEmail(), userInfo.getName());
        } catch (GoogleAuthException e) {
            logger.error("Google code callback failed [{}]: {} - {}", e.getErrorCode(), e.getMessage(), e.getDetails());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ErrorResponse(e.getErrorCode(), e.getMessage(), e.getDetails())
            );
        } catch (Exception e) {
            logger.error("Unexpected error exchanging Google authorization code: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("SERVER_ERROR", "Google authorization failed", "Internal error: " + e.getMessage())
            );
        }

        return processAuthenticatedGoogleUser(userInfo, payload);
    }

    private ResponseEntity<?> processAuthenticatedGoogleUser(GoogleUserInfo userInfo, Map<String, Object> requestBody) {
        String email = userInfo.getEmail();
        String name = userInfo.getName();
        String picture = userInfo.getPicture();

        // 1. Check if user already exists in MySQL
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            // Existing user: update name and photo if missing
            boolean updated = false;
            if ((user.getName() == null || user.getName().isBlank()) && name != null) {
                user.setName(name);
                updated = true;
            }
            if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && picture != null) {
                user.setAvatarUrl(picture);
                updated = true;
            }
            if (updated) {
                user = userRepository.save(user);
            }

            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            logger.info("User logged in via Google: id={}, email={}, role={}", user.getId(), user.getEmail(), user.getRole());

            return ResponseEntity.ok(
                    new LoginResponse(
                            "Google login successful",
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getRole(),
                            token,
                            user.getAvatarUrl(),
                            user.getGender(),
                            user.getAddress(),
                            user.getBio()
                    )
            );
        }

        // 2. New user: check if role was provided in request
        String requestedRoleStr = (String) requestBody.get("role");
        if (requestedRoleStr == null || requestedRoleStr.isBlank()) {
            // First time login without preselected role: trigger onboarding modal
            logger.info("First-time Google user needs role selection: {}", email);
            Map<String, Object> onboardingResponse = new HashMap<>();
            onboardingResponse.put("needsOnboarding", true);
            onboardingResponse.put("email", email);
            onboardingResponse.put("name", name != null ? name : "Google User");
            onboardingResponse.put("picture", picture);
            String onboardingToken = jwtUtil.generateToken(0L, email, "GOOGLE_ONBOARDING");
            onboardingResponse.put("onboardingToken", onboardingToken);
            return ResponseEntity.ok(onboardingResponse);
        }

        // 3. Complete registration for new Google user
        UserRole role;
        try {
            role = UserRole.valueOf(requestedRoleStr.toUpperCase());
        } catch (Exception e) {
            role = UserRole.PET_OWNER;
        }

        User newUser = new User();
        newUser.setName(name != null && !name.isBlank() ? name : "Google User");
        newUser.setEmail(email);
        newUser.setPhone((String) requestBody.get("phone"));
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Secure random password
        newUser.setRole(role);
        newUser.setAvatarUrl(picture);

        String genderStr = (String) requestBody.get("gender");
        if (genderStr != null && !genderStr.isBlank()) {
            try {
                newUser.setGender(com.brunoverse.enums.Gender.valueOf(genderStr.toUpperCase()));
            } catch (Exception ignored) {}
        }

        User savedUser = userRepository.save(newUser);
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        logger.info("Created new user via Google: id={}, email={}, role={}", savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new LoginResponse(
                        "Google registration and onboarding successful",
                        savedUser.getId(),
                        savedUser.getName(),
                        savedUser.getEmail(),
                        savedUser.getRole(),
                        token,
                        savedUser.getAvatarUrl(),
                        savedUser.getGender(),
                        savedUser.getAddress(),
                        savedUser.getBio()
                )
        );
    }

    /**
     * Endpoint for frontend to fetch the active Google OAuth configuration.
     * Ensures frontend and backend use the exact same Client ID and redirect URI.
     */
    @GetMapping("/google/config")
    public ResponseEntity<?> getGoogleConfig() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("configured", googleAuthService.isConfigured());
        resp.put("clientId", googleAuthService.getClientId());
        resp.put("redirectUri", googleAuthService.getRedirectUri());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/google/url")
    public ResponseEntity<?> getGoogleAuthUrl(@RequestParam(required = false) String redirectUri) {
        Map<String, Object> resp = new HashMap<>();
        boolean configured = googleAuthService.isConfigured();
        String effectiveRedirect = (redirectUri != null && !redirectUri.isBlank()) ? redirectUri : googleAuthService.getRedirectUri();

        resp.put("configured", configured);
        resp.put("clientId", googleAuthService.getClientId());
        resp.put("redirectUri", effectiveRedirect);

        String scope = URLEncoder.encode("openid profile email", StandardCharsets.UTF_8);
        String encodedRedirect = URLEncoder.encode(effectiveRedirect, StandardCharsets.UTF_8);
        String authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + (configured ? googleAuthService.getClientId() : "placeholder_client_id") +
                "&redirect_uri=" + encodedRedirect +
                "&response_type=code" +
                "&scope=" + scope +
                "&access_type=offline" +
                "&prompt=consent";

        resp.put("authUrl", authUrl);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "MISSING_AUTH", "message", "Missing or invalid Authorization header"));
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "INVALID_TOKEN", "message", "Token expired or invalid"));
        }
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "NOT_FOUND", "message", "User not found"));
        }
        return ResponseEntity.ok(
                new LoginResponse(
                        "Current user",
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        token,
                        user.getAvatarUrl(),
                        user.getGender(),
                        user.getAddress(),
                        user.getBio()
                )
        );
    }
}
