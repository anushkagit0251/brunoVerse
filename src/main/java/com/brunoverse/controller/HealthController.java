package com.brunoverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "BrunoVerse API");
        response.put("timestamp", Instant.now().toString());

        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            response.put("database", (result != null && result == 1) ? "UP" : "DOWN");
        } catch (Exception e) {
            response.put("database", "DOWN");
            response.put("databaseError", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}
