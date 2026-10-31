package com.brunoverse.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/** Pet owner, rescuer, feeder, veterinarian or NGO account. */
@Entity
@Table(name = "users")
public class AppUser extends BaseEntity {
    public static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    public String name;
    @Column(unique = true)
    public String email;
    /** Accepted on write, never returned. Stored as a BCrypt hash. */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public String password;
    public String phone;
    /** owner | rescuer | feeder | vet | ngo */
    public String role;
    public String city;
    @Column(length = 512)
    public String avatar;
    public Long joined;
    public Boolean available;
    public Integer baseCompleted;
    public Integer baseHelped;
    /** Set only by an admin after checking the person/organisation. */
    public Boolean verified;
    public Double lat;
    public Double lng;
    @JsonProperty("dLat")
    public Double dLat;
    @JsonProperty("dLng")
    public Double dLng;

    @PrePersist
    @PreUpdate
    void hashPassword() {
        if (password != null && !password.startsWith("$2")) password = ENCODER.encode(password);
    }

    public boolean checkPassword(String raw) {
        return password != null && raw != null && ENCODER.matches(raw, password);
    }
}
