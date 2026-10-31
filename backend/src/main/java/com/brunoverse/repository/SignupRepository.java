package com.brunoverse.repository;

import com.brunoverse.model.Signup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SignupRepository extends JpaRepository<Signup, String> {
}
