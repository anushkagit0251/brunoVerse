package com.brunoverse.controller;

import com.brunoverse.config.JwtUtil;
import com.brunoverse.entity.User;
import com.brunoverse.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, 
                           @RequestBody User updated,
                           @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Long tokenUserId = jwtUtil.extractUserId(token);
            if (tokenUserId != null && !tokenUserId.equals(id)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update another user's profile");
            }
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (updated.getName() != null && !updated.getName().isBlank()) user.setName(updated.getName());
        if (updated.getPhone() != null) user.setPhone(updated.getPhone());
        if (updated.getGender() != null) user.setGender(updated.getGender());
        if (updated.getAvatarUrl() != null) user.setAvatarUrl(updated.getAvatarUrl());
        if (updated.getAddress() != null) user.setAddress(updated.getAddress());
        if (updated.getBio() != null) user.setBio(updated.getBio());
        return userRepository.save(user);
    }
}
