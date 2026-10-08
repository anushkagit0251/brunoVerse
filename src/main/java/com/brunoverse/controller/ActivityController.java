package com.brunoverse.controller;

import com.brunoverse.entity.RescueActivity;
import com.brunoverse.repository.RescueActivityRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final RescueActivityRepository rescueActivityRepository;

    public ActivityController(RescueActivityRepository rescueActivityRepository) {
        this.rescueActivityRepository = rescueActivityRepository;
    }

    @GetMapping
    public List<RescueActivity> getAllActivities() {
        return rescueActivityRepository.findAll();
    }

    @PostMapping
    public RescueActivity createActivity(@RequestBody RescueActivity activity) {
        return rescueActivityRepository.save(activity);
    }
}
