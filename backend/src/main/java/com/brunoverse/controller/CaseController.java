package com.brunoverse.controller;

import com.brunoverse.config.CurrentUser;
import com.brunoverse.model.AppUser;
import com.brunoverse.model.Notification;
import com.brunoverse.model.RescueCase;
import com.brunoverse.repository.CaseRepository;
import com.brunoverse.repository.NotificationRepository;
import com.brunoverse.repository.UserRepository;
import com.brunoverse.service.AiService;
import com.brunoverse.service.GeoService;
import com.brunoverse.service.PolicyService;
import jakarta.servlet.http.HttpServletRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/** Rescue cases: report, find nearby, accept, update status, share live location. */
@RestController
@RequestMapping("/api/cases")
public class CaseController {
    private static final List<String> STATUSES = List.of("reported", "accepted", "on_the_way", "reached", "treatment", "resolved");
    private static final Map<String, Integer> URGENCY_ORDER = Map.of("critical", 0, "urgent", 1, "moderate", 2);

    private final CaseRepository cases;
    private final UserRepository users;
    private final NotificationRepository notifications;
    private final AiService ai;
    private final GeoService geo;
    private final ObjectMapper mapper;
    private final PolicyService policy;

    public CaseController(CaseRepository cases, UserRepository users, NotificationRepository notifications,
                          AiService ai, GeoService geo, ObjectMapper mapper, PolicyService policy) {
        this.cases = cases;
        this.users = users;
        this.notifications = notifications;
        this.ai = ai;
        this.geo = geo;
        this.mapper = mapper;
        this.policy = policy;
    }

    @GetMapping
    public List<RescueCase> list(@RequestParam(required = false) String status,
                                 @RequestParam(required = false) String reporterId,
                                 @RequestParam(required = false) String rescuerId) {
        if (reporterId != null) return cases.findByReporterIdOrderByCreatedAtDesc(reporterId);
        if (rescuerId != null) return cases.findByRescuerIdOrderByCreatedAtDesc(rescuerId);
        if (status != null) return cases.findByStatus(status);
        return cases.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id) {
        return cases.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Case not found")));
    }

    /** Open cases near a GPS point, most urgent first, then nearest. */
    @GetMapping("/nearby")
    public List<Map<String, Object>> nearby(@RequestParam double lat, @RequestParam double lng,
                                            @RequestParam(defaultValue = "10") double radiusKm) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (RescueCase c : cases.findByStatus("reported")) {
            double km = geo.km(lat, lng, c.lat, c.lng);
            if (km > radiusKm) continue;
            Map<String, Object> m = mapper.convertValue(c, new TypeReference<Map<String, Object>>() {});
            m.put("distanceKm", Math.round(km * 100) / 100.0);
            m.put("etaMin", geo.etaMinutes(km));
            out.add(m);
        }
        out.sort(Comparator.<Map<String, Object>>comparingInt(m -> URGENCY_ORDER.getOrDefault(String.valueOf(m.get("urgency")), 3))
                .thenComparingDouble(m -> (Double) m.get("distanceKm")));
        return out;
    }

    /** Report an animal in need. Urgency + AI summary are calculated here; rescuers get notified. */
    @PostMapping
    @Transactional
    public ResponseEntity<?> report(@RequestBody RescueCase c, HttpServletRequest req) {
        AppUser me = policy.user(CurrentUser.id(req));
        if (me == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please log in again"));
        c.reporterId = me.id;
        if (c.reporterName == null) c.reporterName = me.name;
        if (c.reporterPhone == null) c.reporterPhone = me.phone;
        if (c.lat == null || c.lng == null) return ResponseEntity.badRequest().body(Map.of("error", "GPS location (lat, lng) is required"));
        long now = System.currentTimeMillis();
        if (c.id == null || cases.existsById(c.id)) c.id = "c_" + UUID.randomUUID().toString().substring(0, 10);
        if (c.createdAt == null) c.createdAt = now;
        c.status = "reported";
        String text = (c.title == null ? "" : c.title) + " " + (c.description == null ? "" : c.description) + " " + String.join(" ", toStrings(c.condition));
        AiService.Triage tr = ai.triage(text);
        c.urgency = tr.level();
        c.aiSummary = ai.summary(c.animal, text, c.address);
        if (c.needs == null) c.needs = "critical".equals(tr.level()) ? "Urgent" : "Medical Help";
        if (c.timeline == null || c.timeline.isEmpty()) c.timeline = new ArrayList<>(List.of(event("reported", now, "Case reported", c.reporterName)));
        cases.save(c);
        for (AppUser u : users.findByRoleIn(List.of("rescuer", "vet", "ngo"))) {
            if (u.id.equals(c.reporterId)) continue;
            String dist = u.lat == null ? "" : String.format(" %.1f km away", geo.km(u.lat, u.lng, c.lat, c.lng));
            notify(u.id, "🚨 New " + c.urgency + " case" + dist + ": " + c.title, "#/case/" + c.id);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(c);
    }

    /** A rescuer takes the case. Returns 409 if someone else already accepted it. */
    @PostMapping("/{id}/accept")
    @Transactional
    public ResponseEntity<?> accept(@PathVariable String id, HttpServletRequest req) {
        AppUser r = policy.user(CurrentUser.id(req));
        if (r == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please log in again"));
        if (!policy.isHelper(r) && !policy.isAdmin(r)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only rescuers, vets and NGOs can accept rescues"));
        RescueCase c = cases.findById(id).orElse(null);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Case not found"));
        if (!"reported".equals(c.status)) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "This case was already taken by another rescuer"));
        c.rescuerId = r.id;
        c.rescuerName = r.name;
        c.rescuerPhone = r.phone;
        c.status = "accepted";
        c.timeline = append(c.timeline, event("accepted", System.currentTimeMillis(), c.rescuerName + " accepted the rescue", c.rescuerName));
        cases.save(c);
        if (c.reporterId != null) notify(c.reporterId, "💚 " + c.rescuerName + " accepted your rescue request for “" + c.title + "”", "#/case/" + c.id);
        return ResponseEntity.ok(c);
    }

    /** Move the case forward: on_the_way → reached → treatment → resolved. */
    @PatchMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> status(@PathVariable String id, @RequestBody Map<String, String> body, HttpServletRequest req) {
        RescueCase c = cases.findById(id).orElse(null);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Case not found"));
        AppUser me = policy.user(CurrentUser.id(req));
        if (me == null || !(me.id.equals(c.rescuerId) || me.id.equals(c.reporterId) || policy.isAdmin(me))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only the assigned rescuer can update this case"));
        }
        String st = body.get("status");
        if (!STATUSES.contains(st)) return ResponseEntity.badRequest().body(Map.of("error", "Status must be one of " + STATUSES));
        c.status = st;
        if ("resolved".equals(st)) c.needs = "Resolved";
        c.timeline = append(c.timeline, event(st, System.currentTimeMillis(), body.getOrDefault("note", st.replace('_', ' ')), body.getOrDefault("by", c.rescuerName)));
        cases.save(c);
        if (c.reporterId != null) notify(c.reporterId, "Update on “" + c.title + "”: " + st.replace('_', ' '), "#/case/" + c.id);
        return ResponseEntity.ok(c);
    }

    /** Rescuer's live GPS while travelling to the animal. */
    @PostMapping("/{id}/location")
    public ResponseEntity<?> location(@PathVariable String id, @RequestBody Map<String, Double> body, HttpServletRequest req) {
        RescueCase c = cases.findById(id).orElse(null);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Case not found"));
        if (!String.valueOf(CurrentUser.id(req)).equals(c.rescuerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only the assigned rescuer shares location"));
        }
        Map<String, Object> loc = new LinkedHashMap<>();
        loc.put("lat", body.get("lat"));
        loc.put("lng", body.get("lng"));
        loc.put("at", System.currentTimeMillis());
        c.rescuerLoc = loc;
        cases.save(c);
        return ResponseEntity.ok(loc);
    }

    private Map<String, Object> event(String status, long at, String note, String by) {
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("status", status);
        e.put("at", at);
        e.put("note", note);
        e.put("by", by);
        return e;
    }

    private List<Object> append(List<Object> list, Object item) {
        List<Object> out = list == null ? new ArrayList<>() : new ArrayList<>(list);
        out.add(item);
        return out;
    }

    private List<String> toStrings(List<Object> list) {
        List<String> out = new ArrayList<>();
        if (list != null) for (Object o : list) out.add(String.valueOf(o));
        return out;
    }

    private void notify(String userId, String text, String link) {
        Notification n = new Notification();
        n.id = "n_" + UUID.randomUUID().toString().substring(0, 10);
        n.userId = userId;
        n.text = text;
        n.link = link;
        n.at = System.currentTimeMillis();
        n.read = false;
        notifications.save(n);
    }
}
