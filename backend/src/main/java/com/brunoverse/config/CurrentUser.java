package com.brunoverse.config;

import jakarta.servlet.http.HttpServletRequest;

/** Helper to read the logged-in user's id (set by AuthInterceptor). */
public final class CurrentUser {
    public static final String ATTR = "brunoverse.uid";

    private CurrentUser() {}

    public static String id(HttpServletRequest req) {
        Object v = req.getAttribute(ATTR);
        return v == null ? null : v.toString();
    }
}
