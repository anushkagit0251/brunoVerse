package com.brunoverse.controller;

import com.brunoverse.entity.HelpProvider;
import com.brunoverse.repository.HelpProviderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/help-providers", "/api/nearby-help"})
public class HelpProviderController {

    private final HelpProviderRepository helpProviderRepository;

    public HelpProviderController(HelpProviderRepository helpProviderRepository) {
        this.helpProviderRepository = helpProviderRepository;
    }

    @GetMapping
    public List<HelpProvider> getAllProviders(@RequestParam(required = false) String type) {
        if (type != null && !type.isBlank()) {
            return helpProviderRepository.findByTypeIgnoreCase(type);
        }
        return helpProviderRepository.findAll();
    }

    @GetMapping("/vets")
    public List<HelpProvider> getNearbyVets() {
        List<HelpProvider> vets = helpProviderRepository.findByTypeIgnoreCase("Veterinarian");
        if (vets.isEmpty()) {
            vets = helpProviderRepository.searchProviders("vet");
        }
        return vets;
    }

    @GetMapping("/ngos")
    public List<HelpProvider> getNearbyNGOs() {
        return helpProviderRepository.findByTypeIgnoreCase("NGO");
    }

    @GetMapping("/shelters")
    public List<HelpProvider> getNearbyShelters() {
        List<HelpProvider> shelters = helpProviderRepository.findByTypeIgnoreCase("Shelter");
        if (shelters.isEmpty()) {
            // Also include NGOs that operate shelters
            shelters = helpProviderRepository.searchProviders("shelter");
            if (shelters.isEmpty()) {
                shelters = helpProviderRepository.findByTypeIgnoreCase("NGO");
            }
        }
        return shelters;
    }

    @GetMapping("/search")
    public List<HelpProvider> searchProviders(@RequestParam(defaultValue = "") String q) {
        if (q == null || q.isBlank()) {
            return helpProviderRepository.findAll();
        }
        return helpProviderRepository.searchProviders(q.trim());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HelpProvider> getProviderDetails(@PathVariable Long id) {
        return helpProviderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public HelpProvider createProvider(@RequestBody HelpProvider provider) {
        return helpProviderRepository.save(provider);
    }
}
