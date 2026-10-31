package com.brunoverse.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    private final boolean demoData;

    public HealthController(@Value("${brunoverse.demo-data:true}") boolean demoData) {
        this.demoData = demoData;
    }

    /** Used by the frontend (and Railway's health check) to detect that the backend is running. */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("status", "ok");
        m.put("app", "BrunoVerse");
        m.put("demo", demoData);
        m.put("time", System.currentTimeMillis());
        return m;
    }
}
