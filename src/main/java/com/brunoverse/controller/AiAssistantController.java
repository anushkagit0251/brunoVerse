package com.brunoverse.controller;

import com.brunoverse.dto.AiAnalysisResponse;
import com.brunoverse.service.AiRescueAssistantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final AiRescueAssistantService aiRescueAssistantService;

    public AiAssistantController(AiRescueAssistantService aiRescueAssistantService) {
        this.aiRescueAssistantService = aiRescueAssistantService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAiStatus() {
        boolean configured = aiRescueAssistantService.isConfigured();
        return ResponseEntity.ok(Map.of(
                "service", "BrunoVerse AI Rescue Vision Assistant",
                "configured", configured,
                "provider", "Google Gemini Vision",
                "recommendedEnvVar", "GEMINI_API_KEY",
                "status", configured ? "ACTIVE" : "READY_PENDING_KEY"
        ));
    }

    @PostMapping(value = "/analyze-animal-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiAnalysisResponse> analyzeUploadedFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photograph file is empty");
        }

        if (file.getSize() > 15 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photograph size exceeds maximum allowed limit of 15MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            contentType = "image/jpeg";
        }

        try {
            byte[] bytes = file.getBytes();
            AiAnalysisResponse response = aiRescueAssistantService.analyzeAnimalImage(bytes, contentType);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read uploaded image: " + e.getMessage());
        }
    }

    @PostMapping(value = "/analyze-image-url", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AiAnalysisResponse> analyzeImageUrl(@RequestBody Map<String, String> body) {
        String imageUrl = body.get("imageUrl");
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "imageUrl is required");
        }

        imageUrl = imageUrl.trim();

        // 1. If it refers to local uploaded file in /api/uploads/xxx
        if (imageUrl.contains("/api/uploads/")) {
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            String envDir = System.getenv("UPLOAD_DIR");
            String uploadDir = (envDir != null && !envDir.isBlank())
                    ? (envDir.endsWith("/") ? envDir : envDir + "/")
                    : System.getProperty("user.dir") + "/uploads/";
            File localFile = new File(uploadDir, filename);

            if (localFile.exists() && localFile.isFile()) {
                try {
                    byte[] bytes = Files.readAllBytes(localFile.toPath());
                    String mimeType = "image/jpeg";
                    if (filename.endsWith(".png")) mimeType = "image/png";
                    else if (filename.endsWith(".webp")) mimeType = "image/webp";

                    AiAnalysisResponse response = aiRescueAssistantService.analyzeAnimalImage(bytes, mimeType);
                    return ResponseEntity.ok(response);
                } catch (IOException e) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read stored photo: " + e.getMessage());
                }
            }
        }

        // 2. Fallback: Return safe triage response if remote image fetch is offline
        AiAnalysisResponse fallback = new AiAnalysisResponse();
        fallback.setSuccess(false);
        fallback.setConfigured(aiRescueAssistantService.isConfigured());
        fallback.setMessage("Direct image URL analysis requires stored file or local upload.");
        return ResponseEntity.ok(fallback);
    }
}
