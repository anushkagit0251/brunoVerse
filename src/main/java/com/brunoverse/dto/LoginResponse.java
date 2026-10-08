package com.brunoverse.dto;

import com.brunoverse.enums.UserRole;

public class LoginResponse {

    private String message;
    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private String token;
    private String avatarUrl;
    private com.brunoverse.enums.Gender gender;
    private String address;
    private String bio;

    public LoginResponse(String message, Long userId, String name,
                         String email, UserRole role) {
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public LoginResponse(String message, Long userId, String name,
                         String email, UserRole role, String token) {
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
    }

    public LoginResponse(String message, Long userId, String name,
                         String email, UserRole role, String token, String avatarUrl) {
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
        this.avatarUrl = avatarUrl;
    }

    public LoginResponse(String message, Long userId, String name,
                         String email, UserRole role, String token, String avatarUrl,
                         com.brunoverse.enums.Gender gender, String address, String bio) {
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
        this.avatarUrl = avatarUrl;
        this.gender = gender;
        this.address = address;
        this.bio = bio;
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

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public com.brunoverse.enums.Gender getGender() {
        return gender;
    }

    public void setGender(com.brunoverse.enums.Gender gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
