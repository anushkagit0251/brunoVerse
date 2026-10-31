package com.brunoverse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.logging.Logger;

/**
 * Signed login tokens (HMAC-SHA256, same idea as a JWT).
 * Token = base64url("userId|expiryMillis") + "." + base64url(signature).
 * Set the JWT_SECRET environment variable in production so tokens survive restarts.
 */
@Service
public class TokenService {
    private static final Logger LOG = Logger.getLogger(TokenService.class.getName());
    private static final long VALIDITY_MS = 30L * 24 * 60 * 60 * 1000; // 30 days
    private static final Base64.Encoder ENC = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DEC = Base64.getUrlDecoder();

    private final byte[] secret;

    public TokenService(@Value("${brunoverse.jwt-secret:}") String configured) {
        if (configured == null || configured.length() < 32) {
            byte[] random = new byte[48];
            new SecureRandom().nextBytes(random);
            this.secret = random;
            LOG.warning("JWT_SECRET is not set (or shorter than 32 characters). Using a random secret: users must log in again after every restart.");
        } else {
            this.secret = configured.getBytes(StandardCharsets.UTF_8);
        }
    }

    public String issue(String userId) {
        String payload = userId + "|" + (System.currentTimeMillis() + VALIDITY_MS);
        String p = ENC.encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return p + "." + ENC.encodeToString(sign(p));
    }

    /** Returns the user id, or null when the token is missing, forged or expired. */
    public String verify(String token) {
        try {
            if (token == null) return null;
            int dot = token.indexOf('.');
            if (dot < 1) return null;
            String p = token.substring(0, dot);
            byte[] sig = DEC.decode(token.substring(dot + 1));
            if (!MessageDigest.isEqual(sig, sign(p))) return null;
            String payload = new String(DEC.decode(p), StandardCharsets.UTF_8);
            int bar = payload.lastIndexOf('|');
            if (bar < 1) return null;
            long exp = Long.parseLong(payload.substring(bar + 1));
            if (exp < System.currentTimeMillis()) return null;
            return payload.substring(0, bar);
        } catch (RuntimeException e) {
            return null;
        }
    }

    private byte[] sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Cannot sign token", e);
        }
    }
}
