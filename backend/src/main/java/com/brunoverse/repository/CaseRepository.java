package com.brunoverse.repository;

import com.brunoverse.model.RescueCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CaseRepository extends JpaRepository<RescueCase, String> {
    List<RescueCase> findByStatus(String status);
    List<RescueCase> findByReporterIdOrderByCreatedAtDesc(String reporterId);
    List<RescueCase> findByRescuerIdOrderByCreatedAtDesc(String rescuerId);
}
