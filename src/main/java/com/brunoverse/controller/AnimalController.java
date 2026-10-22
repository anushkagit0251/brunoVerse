package com.brunoverse.controller;

import com.brunoverse.entity.Animal;
import com.brunoverse.repository.AnimalRepository;
import com.brunoverse.repository.MedicalRecordRepository;
import com.brunoverse.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/animals")
public class AnimalController {

    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final com.brunoverse.config.JwtUtil jwtUtil;

    public AnimalController(AnimalRepository animalRepository,
                            UserRepository userRepository,
                            MedicalRecordRepository medicalRecordRepository,
                            com.brunoverse.config.JwtUtil jwtUtil) {
        this.animalRepository = animalRepository;
        this.userRepository = userRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public Animal createAnimal(@RequestBody Animal animal,
                               @RequestParam(required = false) Long ownerId,
                               @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (animal.getName() == null || animal.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pet name is required");
        }
        if (animal.getType() == null) {
            animal.setType(com.brunoverse.enums.AnimalType.DOG);
        }

        Long effectiveOwnerId = ownerId;
        if (effectiveOwnerId == null && animal.getOwner() != null && animal.getOwner().getId() != null) {
            effectiveOwnerId = animal.getOwner().getId();
        }
        if (effectiveOwnerId == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            effectiveOwnerId = jwtUtil.extractUserId(token);
            if (effectiveOwnerId == null) {
                String email = jwtUtil.extractEmail(token);
                if (email != null) {
                    effectiveOwnerId = userRepository.findByEmail(email).map(com.brunoverse.entity.User::getId).orElse(null);
                }
            }
        }

        if (effectiveOwnerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner ID is required to register a pet companion");
        }

        Long finalOwnerId = effectiveOwnerId;
        animal.setOwner(userRepository.findById(finalOwnerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Owner not found with ID: " + finalOwnerId)));

        return animalRepository.save(animal);
    }

    @GetMapping
    public List<Animal> getAnimals() {
        return animalRepository.findAll();
    }

    @GetMapping("/owner/{ownerId}")
    public List<Animal> getAnimalsByOwner(@PathVariable Long ownerId) {
        return animalRepository.findByOwnerId(ownerId);
    }

    @GetMapping("/{id}")
    public Animal getAnimal(@PathVariable Long id) {
        return animalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Animal not found"));
    }

    @PutMapping("/{id}")
    public Animal updateAnimal(@PathVariable Long id, 
                               @RequestBody Animal updated,
                               @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Animal animal = animalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Animal not found"));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Long tokenUserId = jwtUtil.extractUserId(token);
            if (tokenUserId != null && animal.getOwner() != null && !tokenUserId.equals(animal.getOwner().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this pet companion");
            }
        }

        if (updated.getName() != null && !updated.getName().isBlank()) animal.setName(updated.getName());
        if (updated.getType() != null) animal.setType(updated.getType());
        if (updated.getBreed() != null) animal.setBreed(updated.getBreed());
        if (updated.getAge() != null) animal.setAge(updated.getAge());
        if (updated.getGender() != null) animal.setGender(updated.getGender());
        // Allow updating or clearing/replacing photoUrl
        if (updated.getPhotoUrl() != null) {
            animal.setPhotoUrl(updated.getPhotoUrl().isBlank() ? null : updated.getPhotoUrl());
        }
        return animalRepository.save(animal);
    }

    @DeleteMapping("/{id}")
    public void deleteAnimal(@PathVariable Long id,
                             @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Animal animal = animalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Animal not found"));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Long tokenUserId = jwtUtil.extractUserId(token);
            if (tokenUserId != null && animal.getOwner() != null && !tokenUserId.equals(animal.getOwner().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this pet companion");
            }
        }

        // Remove medical records first
        medicalRecordRepository.findByAnimalId(id).forEach(medicalRecordRepository::delete);
        animalRepository.delete(animal);
    }
}
