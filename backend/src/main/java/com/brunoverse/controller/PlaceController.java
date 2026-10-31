package com.brunoverse.controller;

import com.brunoverse.model.AppUser;
import com.brunoverse.model.Place;
import com.brunoverse.repository.PlaceRepository;
import com.brunoverse.repository.UserRepository;
import com.brunoverse.service.GeoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/** Directory of vets, NGOs, shelters, rescuers and feeders. */
@RestController
@RequestMapping("/api/places")
public class PlaceController {
    private final PlaceRepository places;
    private final UserRepository users;
    private final GeoService geo;

    public PlaceController(PlaceRepository places, UserRepository users, GeoService geo) {
        this.places = places;
        this.users = users;
        this.geo = geo;
    }

    @GetMapping
    public List<Place> list(@RequestParam(required = false) String type) {
        return type == null ? places.findAll() : places.findByType(type);
    }

    /** Nearest help (places + available registered rescuers/vets/NGOs), sorted by distance. */
    @GetMapping("/nearby")
    public List<Map<String, Object>> nearby(@RequestParam double lat, @RequestParam double lng,
                                            @RequestParam(required = false) String type,
                                            @RequestParam(defaultValue = "25") double radiusKm) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Place p : places.findAll()) {
            if (type != null && !type.equals(p.type)) continue;
            double km = geo.km(lat, lng, p.lat, p.lng);
            if (km > radiusKm) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.id); m.put("type", p.type); m.put("name", p.name); m.put("phone", p.phone);
            m.put("lat", p.lat); m.put("lng", p.lng); m.put("hours", p.hours); m.put("services", p.services);
            m.put("verified", p.verified); m.put("emergency", p.emergency); m.put("distanceKm", Math.round(km * 100) / 100.0);
            out.add(m);
        }
        for (AppUser u : users.findByRoleIn(List.of("rescuer", "vet", "ngo", "feeder"))) {
            if (Boolean.FALSE.equals(u.available) || u.lat == null) continue;
            String t = "ngo".equals(u.role) ? "ngo" : u.role;
            if (type != null && !type.equals(t)) continue;
            double km = geo.km(lat, lng, u.lat, u.lng);
            if (km > radiusKm) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.id); m.put("userId", u.id); m.put("type", t); m.put("name", u.name); m.put("phone", u.phone);
            m.put("lat", u.lat); m.put("lng", u.lng); m.put("verified", Boolean.TRUE.equals(u.verified)); m.put("distanceKm", Math.round(km * 100) / 100.0);
            out.add(m);
        }
        out.sort(Comparator.comparingDouble(m -> (Double) m.get("distanceKm")));
        return out;
    }

    /** Register an organisation (listed unverified until documents are reviewed). */
    @PostMapping
    public ResponseEntity<Place> register(@RequestBody Place p) {
        if (p.id == null) p.id = "p_" + UUID.randomUUID().toString().substring(0, 8);
        p.verified = false;
        return ResponseEntity.status(HttpStatus.CREATED).body(places.save(p));
    }
}
