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

    public AnimalController(AnimalRepository animalRepository,
                            UserRepository userRepository,
                            MedicalRecordRepository medicalRecordRepository) {
        this.animalRepository = animalRepository;
        this.userRepository = userRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @PostMapping
    public Animal createAnimal(@RequestBody Animal animal,
                               @RequestParam Long ownerId) {

        animal.setOwner(userRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Owner not found")));

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
    public Animal updateAnimal(@PathVariable Long id, @RequestBody Animal updated) {
        Animal animal = animalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Animal not found"));
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
    public void deleteAnimal(@PathVariable Long id) {
        Animal animal = animalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Animal not found"));
        // Remove medical records first
        medicalRecordRepository.findByAnimalId(id).forEach(medicalRecordRepository::delete);
        animalRepository.delete(animal);
    }
}
