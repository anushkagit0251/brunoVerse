package com.brunoverse.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.math.BigInteger;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.RSAPublicKeySpec;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GoogleAuthService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthService.class);

    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";
    private static final String GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
    private static final String GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

    @Value("${google.client.id:}")
    private String configuredClientId;

    @Value("${google.client.secret:}")
    private String configuredClientSecret;

    @Value("${google.redirect-uri:http://localhost:5173/auth/google/callback}")
    private String configuredRedirectUri;

    private String clientId;
    private String clientSecret;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // Cache of Google public keys (kid -> RSAPublicKey)
    private final Map<String, PublicKey> cachedPublicKeys = new HashMap<>();
    private long certsCacheTimestamp = 0;
    private static final long CERTS_CACHE_TTL_MS = 1000L * 60 * 60; // 1 hour

    @PostConstruct
    public void init() {
        // Load from environment or properties
        this.clientId = configuredClientId;
        this.clientSecret = configuredClientSecret;

        if (this.clientId == null || this.clientId.isBlank()) {
            this.clientId = System.getenv("GOOGLE_CLIENT_ID");
        }
        if (this.clientSecret == null || this.clientSecret.isBlank()) {
            this.clientSecret = System.getenv("GOOGLE_CLIENT_SECRET");
        }

        // Fallback: check local .env or frontend/.env
        if ((this.clientId == null || this.clientId.isBlank()) || (this.clientSecret == null || this.clientSecret.isBlank())) {
            loadFromDotEnv();
        }

        if (isConfigured()) {
            logger.info("Google OAuth 2.0 initialized successfully. Client ID: {}...{}",
                    clientId.substring(0, Math.min(12, clientId.length())),
                    clientId.length() > 12 ? clientId.substring(clientId.length() - 6) : "");
        } else {
            logger.warn("Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) not yet configured. Please set environment variables.");
        }
    }

    private void loadFromDotEnv() {
        String[] potentialPaths = {
                ".env",
                "frontend/.env",
                "../.env",
                System.getProperty("user.dir") + "/.env",
                System.getProperty("user.dir") + "/frontend/.env"
        };

        for (String pathStr : potentialPaths) {
            File file = new File(pathStr);
            if (file.exists() && file.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(file.toPath());
                    for (String line : lines) {
                        line = line.trim();
                        if (line.startsWith("#") || !line.contains("=")) continue;
                        String[] kv = line.split("=", 2);
                        String key = kv[0].trim();
                        String val = kv[1].trim().replaceAll("^[\"']|[\"']$", "");

                        if ((key.equals("GOOGLE_CLIENT_ID") || key.equals("VITE_GOOGLE_CLIENT_ID")) && (this.clientId == null || this.clientId.isBlank())) {
                            this.clientId = val;
                            logger.info("Loaded GOOGLE_CLIENT_ID from {}", pathStr);
                        }
                        if (key.equals("GOOGLE_CLIENT_SECRET") && (this.clientSecret == null || this.clientSecret.isBlank())) {
                            this.clientSecret = val;
                            logger.info("Loaded GOOGLE_CLIENT_SECRET from {}", pathStr);
                        }
                    }
                } catch (Exception e) {
                    logger.debug("Could not read env file {}: {}", pathStr, e.getMessage());
                }
            }
        }
    }

    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank() && !clientId.contains("placeholder");
    }

    public String getClientId() {
        return clientId != null ? clientId : "";
    }

    public String getClientSecret() {
        return clientSecret != null ? clientSecret : "";
    }

    public String getRedirectUri() {
        return configuredRedirectUri;
    }

    /**
     * Verifies a Google OpenID Connect ID token according to OIDC standards:
     * 1. JWT structure
     * 2. Issuer is accounts.google.com or https://accounts.google.com
     * 3. Audience matches GOOGLE_CLIENT_ID
     * 4. Expiration timestamp
     * 5. email_verified is true
     * 6. Cryptographic signature with Google's public keys / TokenInfo
     */
    public GoogleUserInfo verifyIdToken(String idToken) throws GoogleAuthException {
        if (idToken == null || idToken.isBlank()) {
            logger.error("Google ID Token verification failed: token is null or blank");
            throw new GoogleAuthException("MISSING_CREDENTIAL", "Google token verification failed", "Google credential / ID token is required");
        }

        String[] parts = idToken.split("\\.");
        if (parts.length != 3) {
            logger.error("Google ID Token verification failed: malformed token has {} parts (expected 3)", parts.length);
            throw new GoogleAuthException("MALFORMED_TOKEN", "Invalid ID Token", "Malformed Google ID token: expected 3 dot-separated JWT parts. Ensure an ID Token (JWT) is provided, not an access token or raw string");
        }

        String headerJson = decodeBase64Safe(parts[0]);
        String payloadJson = decodeBase64Safe(parts[1]);

        logger.debug("Google token header: {}", headerJson);
        logger.debug("Google token payload: {}", payloadJson);

        // 1. Extract claims from payload
        String iss = extractJsonField(payloadJson, "iss");
        String aud = extractJsonField(payloadJson, "aud");
        String email = extractJsonField(payloadJson, "email");
        String emailVerifiedRaw = extractJsonField(payloadJson, "email_verified");
        boolean emailVerified = "true".equalsIgnoreCase(emailVerifiedRaw) ||
                payloadJson.contains("\"email_verified\":true") ||
                payloadJson.contains("\"email_verified\": true");
        String name = extractJsonField(payloadJson, "name");
        String picture = extractJsonField(payloadJson, "picture");
        String sub = extractJsonField(payloadJson, "sub");
        long exp = extractJsonLong(payloadJson, "exp");

        logger.info("Validating Google Token: email={}, iss={}, aud={}, exp={}", email, iss, aud, exp);

        // 2. Validate Issuer (iss)
        if (iss == null || (!"accounts.google.com".equals(iss) && !"https://accounts.google.com".equals(iss))) {
            logger.error("Issuer validation failed: expected 'accounts.google.com' or 'https://accounts.google.com', got '{}'", iss);
            throw new GoogleAuthException("INVALID_ISSUER", "Google verification failed", "Invalid token issuer (iss): '" + iss + "'. Expected accounts.google.com or https://accounts.google.com");
        }

        // 3. Validate Audience (aud)
        if (isConfigured()) {
            if (aud == null || !aud.equals(this.clientId)) {
                logger.error("Audience validation failed! Configured Client ID: '{}', but token aud: '{}'", this.clientId, aud);
                throw new GoogleAuthException("INVALID_AUDIENCE", "Google token verification failed", "Audience mismatch: Token audience (" + aud + ") does not match configured GOOGLE_CLIENT_ID (" + this.clientId + ")");
            }
        } else {
            logger.warn("GOOGLE_CLIENT_ID is not configured in backend. Token aud was: {}", aud);
        }

        // 4. Validate Expiration (exp)
        long currentEpochSec = System.currentTimeMillis() / 1000L;
        if (exp > 0 && exp < currentEpochSec) {
            logger.error("Token expiration validation failed: exp={} is earlier than current time={}", exp, currentEpochSec);
            throw new GoogleAuthException("TOKEN_EXPIRED", "Token expired", "Google token has expired at timestamp " + exp + " (current server time: " + currentEpochSec + ")");
        }

        // 5. Validate email
        if (email == null || email.isBlank()) {
            logger.error("Token email extraction failed: payload contains no email");
            throw new GoogleAuthException("MISSING_EMAIL", "Google verification failed", "Google token payload does not contain an email address");
        }

        // 6. Validate email_verified
        if (!emailVerified) {
            logger.error("Email verification validation failed: email {} is not marked as verified", email);
            throw new GoogleAuthException("EMAIL_NOT_VERIFIED", "Google verification failed", "Google account email (" + email + ") is not marked as verified by Google");
        }

        // 7. Validate Cryptographic Signature
        boolean signatureVerified = false;
        String signatureError = null;

        // Try TokenInfo online verification first
        try {
            signatureVerified = verifyWithTokenInfo(idToken, email, aud);
        } catch (GoogleAuthException ge) {
            throw ge;
        } catch (Exception e) {
            logger.warn("TokenInfo verification attempt error: {}", e.getMessage());
            signatureError = e.getMessage();
        }

        // If TokenInfo did not succeed, try Public Key JWKS verification
        if (!signatureVerified) {
            try {
                String kid = extractJsonField(headerJson, "kid");
                signatureVerified = verifyWithGooglePublicKeys(parts, kid);
            } catch (Exception e) {
                logger.warn("Public key verification attempt error: {}", e.getMessage());
                if (signatureError == null) signatureError = e.getMessage();
            }
        }

        if (!signatureVerified) {
            logger.error("Cryptographic signature verification failed for Google token. Detail: {}", signatureError);
            throw new GoogleAuthException("INVALID_SIGNATURE", "Google verification failed", "Cryptographic signature verification failed: " + (signatureError != null ? signatureError : "Signature invalid or could not be verified with Google public keys"));
        }

        logger.info("Google ID token verified successfully for: {}", email);
        return new GoogleUserInfo(email, emailVerified, name, picture, sub, aud, iss, exp);
    }

    /**
     * Verifies token with Google's official TokenInfo endpoint.
     */
    private boolean verifyWithTokenInfo(String idToken, String expectedEmail, String expectedAud) throws Exception {
        String verifyUrl = GOOGLE_TOKENINFO_URL + "?id_token=" + URLEncoder.encode(idToken, StandardCharsets.UTF_8);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(verifyUrl))
                .timeout(Duration.ofSeconds(6))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            String respBody = response.body();
            String returnedEmail = extractJsonField(respBody, "email");
            String returnedAud = extractJsonField(respBody, "aud");

            if (returnedEmail != null && returnedEmail.equalsIgnoreCase(expectedEmail)) {
                if (isConfigured() && returnedAud != null && !returnedAud.equals(this.clientId)) {
                    throw new GoogleAuthException("INVALID_AUDIENCE", "TokenInfo returned aud " + returnedAud + " does not match configured GOOGLE_CLIENT_ID " + this.clientId);
                }
                return true;
            }
        } else {
            logger.warn("Google TokenInfo returned status {}: {}", response.statusCode(), response.body());
        }
        return false;
    }

    /**
     * Verifies RS256 signature using Google's public certificates (JWKS).
     */
    private boolean verifyWithGooglePublicKeys(String[] jwtParts, String kid) {
        try {
            refreshGoogleCertsIfNeeded();
            PublicKey key = cachedPublicKeys.get(kid);
            if (key == null) {
                // Force refresh certs in case key was rotated
                fetchGoogleCerts();
                key = cachedPublicKeys.get(kid);
            }

            if (key == null) {
                logger.warn("Could not find Google public key matching kid: {}", kid);
                return false;
            }

            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(key);
            byte[] signedContent = (jwtParts[0] + "." + jwtParts[1]).getBytes(StandardCharsets.UTF_8);
            sig.update(signedContent);

            byte[] signatureBytes = Base64.getUrlDecoder().decode(jwtParts[2]);
            return sig.verify(signatureBytes);
        } catch (Exception e) {
            logger.error("Error verifying signature with Google public key: {}", e.getMessage(), e);
            return false;
        }
    }

    private synchronized void refreshGoogleCertsIfNeeded() {
        if (System.currentTimeMillis() - certsCacheTimestamp > CERTS_CACHE_TTL_MS || cachedPublicKeys.isEmpty()) {
            fetchGoogleCerts();
        }
    }

    private void fetchGoogleCerts() {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(GOOGLE_CERTS_URL))
                    .timeout(Duration.ofSeconds(6))
                    .GET()
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                parseJwksKeys(resp.body());
                certsCacheTimestamp = System.currentTimeMillis();
                logger.info("Fetched and cached {} Google public keys from JWKS", cachedPublicKeys.size());
            }
        } catch (Exception e) {
            logger.warn("Failed to fetch Google JWKS public certs: {}", e.getMessage());
        }
    }

    private void parseJwksKeys(String jwksJson) {
        try {
            // Find each {"kid": "...", "n": "...", "e": "...", ...} in "keys": [...]
            Pattern keyPattern = Pattern.compile("\\{[^\\{\\}]*\"kid\"\\s*:\\s*\"([^\"]+)\"[^\\{\\}]*\"n\"\\s*:\\s*\"([^\"]+)\"[^\\{\\}]*\"e\"\\s*:\\s*\"([^\"]+)\"[^\\{\\}]*\\}");
            Matcher m = keyPattern.matcher(jwksJson);
            while (m.find()) {
                String kid = m.group(1);
                String nStr = m.group(2);
                String eStr = m.group(3);

                byte[] nBytes = Base64.getUrlDecoder().decode(nStr);
                byte[] eBytes = Base64.getUrlDecoder().decode(eStr);

                BigInteger modulus = new BigInteger(1, nBytes);
                BigInteger exponent = new BigInteger(1, eBytes);

                RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
                KeyFactory factory = KeyFactory.getInstance("RSA");
                PublicKey pubKey = factory.generatePublic(spec);

                cachedPublicKeys.put(kid, pubKey);
            }
        } catch (Exception e) {
            logger.warn("Error parsing JWKS keys: {}", e.getMessage());
        }
    }

    /**
     * Exchanges an authorization code for tokens, then verifies ID token and returns GoogleUserInfo.
     */
    public GoogleUserInfo exchangeCodeForUserInfo(String code, String redirectUri) throws GoogleAuthException {
        if (code == null || code.isBlank()) {
            throw new GoogleAuthException("EMPTY_CODE", "Google authorization failed", "Authorization code is required");
        }
        if (!isConfigured()) {
            throw new GoogleAuthException("NOT_CONFIGURED", "Invalid Google Client ID", "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not configured on the backend server");
        }

        String effectiveRedirect = (redirectUri != null && !redirectUri.isBlank()) ? redirectUri : this.configuredRedirectUri;

        try {
            String formBody = "code=" + URLEncoder.encode(code, StandardCharsets.UTF_8) +
                    "&client_id=" + URLEncoder.encode(this.clientId, StandardCharsets.UTF_8) +
                    "&client_secret=" + URLEncoder.encode(this.clientSecret, StandardCharsets.UTF_8) +
                    "&redirect_uri=" + URLEncoder.encode(effectiveRedirect, StandardCharsets.UTF_8) +
                    "&grant_type=authorization_code";

            HttpRequest tokenReq = HttpRequest.newBuilder()
                    .uri(URI.create(GOOGLE_TOKEN_ENDPOINT))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(formBody))
                    .build();

            HttpResponse<String> tokenResp = httpClient.send(tokenReq, HttpResponse.BodyHandlers.ofString());
            if (tokenResp.statusCode() != 200) {
                logger.error("Google token exchange failed with HTTP {}: {}", tokenResp.statusCode(), tokenResp.body());
                String errDesc = extractJsonField(tokenResp.body(), "error_description");
                String errType = extractJsonField(tokenResp.body(), "error");
                if (errDesc == null) errDesc = errType;
                
                if ("redirect_uri_mismatch".equalsIgnoreCase(errType) || (errDesc != null && errDesc.contains("redirect_uri_mismatch"))) {
                    throw new GoogleAuthException("REDIRECT_URI_MISMATCH", "Redirect URI mismatch",
                            "The redirect URI (" + effectiveRedirect + ") does not match the authorized redirect URI registered in Google Cloud Console. Details: " + errDesc);
                }
                
                throw new GoogleAuthException("EXCHANGE_FAILED", "Google authorization failed",
                        "Failed to exchange authorization code with Google: " + (errDesc != null ? errDesc : tokenResp.body()));
            }

            String respBody = tokenResp.body();
            String idToken = extractJsonField(respBody, "id_token");
            String accessToken = extractJsonField(respBody, "access_token");

            GoogleUserInfo userInfo = null;
            if (idToken != null) {
                try {
                    userInfo = verifyIdToken(idToken);
                } catch (Exception e) {
                    logger.warn("Could not verify id_token from code exchange: {}", e.getMessage());
                }
            }

            // Fallback or complement with userinfo endpoint
            if (accessToken != null && (userInfo == null || userInfo.getName() == null)) {
                try {
                    HttpRequest userReq = HttpRequest.newBuilder()
                            .uri(URI.create(GOOGLE_USERINFO_ENDPOINT))
                            .header("Authorization", "Bearer " + accessToken)
                            .timeout(Duration.ofSeconds(6))
                            .GET()
                            .build();
                    HttpResponse<String> userResp = httpClient.send(userReq, HttpResponse.BodyHandlers.ofString());
                    if (userResp.statusCode() == 200) {
                        String uBody = userResp.body();
                        String uEmail = extractJsonField(uBody, "email");
                        String uName = extractJsonField(uBody, "name");
                        String uPic = extractJsonField(uBody, "picture");
                        String uSub = extractJsonField(uBody, "sub");

                        if (userInfo == null && uEmail != null) {
                            userInfo = new GoogleUserInfo(uEmail, true, uName, uPic, uSub, this.clientId, "https://accounts.google.com", System.currentTimeMillis() / 1000L + 3600);
                        } else if (userInfo != null) {
                            if (userInfo.getName() == null) userInfo.setName(uName);
                            if (userInfo.getPicture() == null) userInfo.setPicture(uPic);
                        }
                    }
                } catch (Exception e) {
                    logger.warn("Could not fetch userinfo from Google: {}", e.getMessage());
                }
            }

            if (userInfo == null) {
                throw new GoogleAuthException("USERINFO_FAILED", "Could not obtain user profile from Google token response");
            }

            return userInfo;

        } catch (GoogleAuthException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during Google code exchange: {}", e.getMessage(), e);
            throw new GoogleAuthException("EXCHANGE_ERROR", "Error communicating with Google OAuth servers: " + e.getMessage(), e);
        }
    }

    public static String extractJsonField(String json, String key) {
        if (json == null) return null;
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"([^\"]+)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    public static long extractJsonLong(String json, String key) {
        if (json == null) return 0L;
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*([0-9]+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            try {
                return Long.parseLong(matcher.group(1));
            } catch (Exception ignored) {}
        }
        // Try string number
        Pattern strPattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"([0-9]+)\"");
        Matcher strMatcher = strPattern.matcher(json);
        if (strMatcher.find()) {
            try {
                return Long.parseLong(strMatcher.group(1));
            } catch (Exception ignored) {}
        }
        return 0L;
    }

    public static String decodeBase64Safe(String base64) {
        if (base64 == null) return "{}";
        try {
            String padded = base64;
            while (padded.length() % 4 != 0) {
                padded += "=";
            }
            byte[] bytes = Base64.getUrlDecoder().decode(padded);
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "{}";
        }
    }
}
