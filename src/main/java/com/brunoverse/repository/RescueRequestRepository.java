package com.brunoverse.repository;

import com.brunoverse.entity.RescueRequest;
import com.brunoverse.enums.RescueStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RescueRequestRepository extends JpaRepository<RescueRequest, Long> {

    List<RescueRequest> findByStatus(RescueStatus status);

    List<RescueRequest> findByAssignedRescuerId(Long rescuerId);
}
