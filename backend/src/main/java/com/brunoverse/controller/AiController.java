package com.brunoverse.controller;

import com.brunoverse.service.AiService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Emergency categorisation for any free-text description (English / Hindi / Hinglish). */
@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiService ai;

    public AiController(AiService ai) {
        this.ai = ai;
    }

    /** Body: {"text": "dog bleeding from leg after bike accident"} */
    @PostMapping("/triage")
    public AiService.Triage triage(@RequestBody Map<String, String> body) {
        return ai.triage(body.getOrDefault("text", ""));
    }
}
