package com.brunoverse.dto;

import com.brunoverse.enums.UserRole;

public class LoginResponse {

    private String message;
    private Long userId;
    private String name;
    private String email;
    private UserRole role;

    public LoginResponse(String message, Long userId, String name,
                         String email, UserRole role) {
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }
}
