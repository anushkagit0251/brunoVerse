package com.brunoverse.controller;

import com.brunoverse.dto.RescueStatsResponse;
import com.brunoverse.entity.RescueRequest;
import com.brunoverse.entity.User;
import com.brunoverse.enums.RescueStatus;
import com.brunoverse.repository.RescueRequestRepository;
import com.brunoverse.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rescues")
public class RescueRequestController {

    private final RescueRequestRepository rescueRequestRepository;
    private final UserRepository userRepository;

    public RescueRequestController(RescueRequestRepository rescueRequestRepository,
                                   UserRepository userRepository) {
        this.rescueRequestRepository = rescueRequestRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<RescueRequest> createRescueRequest(
            @RequestBody RescueRequest request,
            @RequestParam(required = false) Long reportedById) {

        if (reportedById != null) {
            User reporter = userRepository.findById(reportedById).orElse(null);
            request.setReportedBy(reporter);
        }
        if (request.getStatus() == null) {
            request.setStatus(RescueStatus.PENDING);
        }
        if (request.getCreatedAt() == null) {
            request.setCreatedAt(LocalDateTime.now());
        }

        RescueRequest saved = rescueRequestRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<RescueRequest> getRescueRequests(
            @RequestParam(required = false) RescueStatus status) {
        if (status != null) {
            return rescueRequestRepository.findByStatus(status);
        }
        return rescueRequestRepository.findAll();
    }

    @GetMapping("/{id}")
    public RescueRequest getRescueRequest(@PathVariable Long id) {
        return rescueRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rescue request not found"));
    }

    @GetMapping("/rescuer/{rescuerId}")
    public List<RescueRequest> getByRescuer(@PathVariable Long rescuerId) {
        return rescueRequestRepository.findByAssignedRescuerId(rescuerId);
    }

    @GetMapping("/reporter/{reporterId}")
    public List<RescueRequest> getByReporter(@PathVariable Long reporterId) {
        return rescueRequestRepository.findByReportedById(reporterId);
    }

    @PutMapping("/{id}/status")
    public RescueRequest updateStatus(
            @PathVariable Long id,
            @RequestParam RescueStatus status,
            @RequestParam(required = false) Long rescuerId) {

        RescueRequest rescue = rescueRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rescue request not found"));

        rescue.setStatus(status);
        if (rescuerId != null) {
            User rescuer = userRepository.findById(rescuerId).orElse(null);
            if (rescuer != null) {
                rescue.setAssignedRescuer(rescuer);
            }
        }

        return rescueRequestRepository.save(rescue);
    }

    @GetMapping("/stats")
    public RescueStatsResponse getStats() {
        List<RescueRequest> all = rescueRequestRepository.findAll();
        long pending = all.stream().filter(r -> r.getStatus() == RescueStatus.PENDING).count();
        long active = all.stream().filter(r -> r.getStatus() == RescueStatus.ACCEPTED || r.getStatus() == RescueStatus.IN_PROGRESS).count();
        long completed = all.stream().filter(r -> r.getStatus() == RescueStatus.COMPLETED).count();
        long totalHelped = completed + active;

        return new RescueStatsResponse(pending, active, completed, totalHelped);
    }
}
