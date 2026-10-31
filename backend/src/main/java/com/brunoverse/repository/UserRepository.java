package com.brunoverse.repository;

import com.brunoverse.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, String> {
    Optional<AppUser> findByEmailIgnoreCase(String email);
    Optional<AppUser> findFirstByPhone(String phone);
    List<AppUser> findByRoleIn(List<String> roles);
}
