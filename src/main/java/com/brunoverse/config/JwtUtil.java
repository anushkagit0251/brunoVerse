package com.brunoverse.config;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class JwtUtil {

    private static final String SECRET = "BrunoVerse_Secure_JWT_Secret_Key_2026_Animal_Welfare_Care_Connect";
    private static final long EXPIRATION_TIME_MS = 1000L * 60 * 60 * 24 * 7; // 7 days

    public String generateToken(Long userId, String email, String role) {
        try {
            long now = System.currentTimeMillis();
            long exp = now + EXPIRATION_TIME_MS;

            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String payloadJson = "{\"sub\":\"" + escapeJson(email) + "\",\"userId\":" + userId + ",\"role\":\"" + escapeJson(role) + "\",\"iat\":" + (now / 1000) + ",\"exp\":" + (exp / 1000) + "}";

            String encodedHeader = Base64.getUrlEncoder().withoutPadding().encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
            String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
            String data = encodedHeader + "." + encodedPayload;

            String signature = sign(data);
            return data + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error creating JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;

            String data = parts[0] + "." + parts[1];
            String expectedSignature = sign(data);
            if (!MessageDigest.isEqual(parts[2].getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            String payload = new String(payloadBytes, StandardCharsets.UTF_8);

            Pattern expPattern = Pattern.compile("\"exp\":\\s*(\\d+)");
            Matcher m = expPattern.matcher(payload);
            if (m.find()) {
                long exp = Long.parseLong(m.group(1));
                if (System.currentTimeMillis() / 1000 > exp) {
                    return false;
                }
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractEmail(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            String payload = new String(payloadBytes, StandardCharsets.UTF_8);

            Pattern subPattern = Pattern.compile("\"sub\":\\s*\"([^\"]+)\"");
            Matcher m = subPattern.matcher(payload);
            if (m.find()) {
                return m.group(1);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public Long extractUserId(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            String payload = new String(payloadBytes, StandardCharsets.UTF_8);

            Pattern pattern = Pattern.compile("\"userId\":\\s*(\\d+)");
            Matcher m = pattern.matcher(payload);
            if (m.find()) {
                return Long.parseLong(m.group(1));
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}

