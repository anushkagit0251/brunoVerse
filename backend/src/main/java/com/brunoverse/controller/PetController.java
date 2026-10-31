package com.brunoverse.controller;

import com.brunoverse.config.CurrentUser;
import com.brunoverse.model.Pet;
import com.brunoverse.repository.PetRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Pet profiles and health records. */
@RestController
@RequestMapping("/api/pets")
public class PetController {
    private final PetRepository pets;

    public PetController(PetRepository pets) {
        this.pets = pets;
    }

    /** The logged-in owner's pets. */
    @GetMapping
    public List<Pet> list(HttpServletRequest req) {
        return pets.findByOwnerId(CurrentUser.id(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id, HttpServletRequest req) {
        Pet p = pets.findById(id).orElse(null);
        if (p == null || !String.valueOf(CurrentUser.id(req)).equals(p.ownerId)) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Pet not found"));
        return ResponseEntity.ok(p);
    }

    /** Short health summary a pet owner can share with a vet. */
    @GetMapping("/{id}/summary")
    public ResponseEntity<?> summary(@PathVariable String id, HttpServletRequest req) {
        Pet p = pets.findById(id).orElse(null);
        if (p == null || !String.valueOf(CurrentUser.id(req)).equals(p.ownerId)) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Pet not found"));
        String text = p.name + " — " + nz(p.breed, p.species) + ", " + nz(p.gender, "") + ", born " + nz(p.dob, "?")
                + ", " + nz(p.weight, "?") + " kg. Vaccinations recorded: " + (p.vaccinations == null ? 0 : p.vaccinations.size())
                + ". Medical records: " + (p.records == null ? 0 : p.records.size()) + ". Notes: " + nz(p.notes, "—");
        return ResponseEntity.ok(Map.of("petId", p.id, "summary", text));
    }

    private static String nz(String v, String d) {
        return v == null || v.isBlank() ? d : v;
    }
}
