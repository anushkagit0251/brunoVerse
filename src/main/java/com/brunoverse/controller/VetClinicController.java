package com.brunoverse.controller;

import com.brunoverse.dto.VetClinicDto;
import com.brunoverse.service.VetPlacesService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vets")
public class VetClinicController {

    private final VetPlacesService vetPlacesService;

    public VetClinicController(VetPlacesService vetPlacesService) {
        this.vetPlacesService = vetPlacesService;
    }

    @GetMapping("/nearby")
    public List<VetClinicDto> getNearbyVets(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "10000") Integer radius) {
        return vetPlacesService.getNearbyVets(lat, lng, radius);
    }

    @GetMapping("/search")
    public List<VetClinicDto> searchVets(
            @RequestParam String query,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return vetPlacesService.searchVets(query, lat, lng);
    }
}
