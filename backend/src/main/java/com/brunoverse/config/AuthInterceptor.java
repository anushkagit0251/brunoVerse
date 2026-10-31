package com.brunoverse.config;

import com.brunoverse.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Reads "Authorization: Bearer <token>" on every /api call.
 * Public endpoints work without a token; everything else returns 401.
 * Controllers read the logged-in user id with CurrentUser.id(request).
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {
    private final TokenService tokens;

    public AuthInterceptor(TokenService tokens) {
        this.tokens = tokens;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
        String method = req.getMethod();
        if ("OPTIONS".equals(method)) return true;

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String uid = tokens.verify(header.substring(7).trim());
            if (uid != null) req.setAttribute(CurrentUser.ATTR, uid);
        }
        if (isPublic(method, req.getRequestURI()) || req.getAttribute(CurrentUser.ATTR) != null) return true;

        res.setStatus(401);
        res.setContentType("application/json");
        res.getWriter().write("{\"error\":\"Please log in again\"}");
        return false;
    }

    private boolean isPublic(String method, String path) {
        if (path.equals("/api/health") || path.equals("/api/auth/login") || path.equals("/api/auth/signup")) return true;
        if ("GET".equals(method) && (path.equals("/api/bootstrap") || path.startsWith("/api/media/") || path.startsWith("/api/places"))) return true;
        return "POST".equals(method) && path.equals("/api/ai/triage");
    }
}
