package com.brunoverse.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/** Photo / video uploads for rescue cases, pets, records and chat. Videos support seeking (HTTP Range). */
@RestController
@RequestMapping("/api/media")
public class MediaController {
    private static final Set<String> ALLOWED = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".mp4", ".webm", ".mov", ".3gp", ".m4v", ".pdf");

    private final Path dir;

    public MediaController(@Value("${brunoverse.upload-dir:uploads}") String uploadDir) throws IOException {
        this.dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.dir);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Empty file"));
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : extFromType(file.getContentType());
        if (!ALLOWED.contains(ext)) return ResponseEntity.badRequest().body(Map.of("error", "Only photos, videos and PDFs are allowed"));
        String name = UUID.randomUUID().toString().replace("-", "") + ext;
        file.transferTo(dir.resolve(name));
        String type = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", name, "url", "/api/media/" + name, "type", type));
    }

    @GetMapping("/{name}")
    public ResponseEntity<Resource> get(@PathVariable String name) {
        Path file = dir.resolve(name).normalize();
        if (!file.startsWith(dir) || !Files.exists(file)) return ResponseEntity.notFound().build();
        Resource res = new FileSystemResource(file);
        MediaType type = MediaTypeFactory.getMediaType(res).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok().contentType(type).body(res);
    }

    private static String extFromType(String type) {
        if (type == null) return "";
        if (type.startsWith("video/")) return type.contains("webm") ? ".webm" : ".mp4";
        if (type.contains("png")) return ".png";
        if (type.startsWith("image/")) return ".jpg";
        return "";
    }
}
