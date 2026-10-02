package com.brunoverse.controller;

import com.brunoverse.entity.Animal;
import com.brunoverse.repository.AnimalRepository;
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

    public AnimalController(AnimalRepository animalRepository,
                             UserRepository userRepository) {
        this.animalRepository = animalRepository;
        this.userRepository = userRepository;
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
}
