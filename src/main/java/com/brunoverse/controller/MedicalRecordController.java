package com.brunoverse.controller;

import com.brunoverse.entity.Animal;
import com.brunoverse.entity.MedicalRecord;
import com.brunoverse.repository.AnimalRepository;
import com.brunoverse.repository.MedicalRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AnimalRepository animalRepository;

    public MedicalRecordController(MedicalRecordRepository medicalRecordRepository,
                                   AnimalRepository animalRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.animalRepository = animalRepository;
    }

    @PostMapping
    public ResponseEntity<MedicalRecord> createMedicalRecord(
            @RequestBody MedicalRecord record,
            @RequestParam Long animalId) {

        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Animal not found"));

        record.setAnimal(animal);
        MedicalRecord saved = medicalRecordRepository.save(record);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/animal/{animalId}")
    public List<MedicalRecord> getByAnimal(@PathVariable Long animalId) {
        return medicalRecordRepository.findByAnimalId(animalId);
    }

    @GetMapping("/owner/{ownerId}")
    public List<MedicalRecord> getByOwner(@PathVariable Long ownerId) {
        List<Animal> pets = animalRepository.findByOwnerId(ownerId);
        List<MedicalRecord> results = new ArrayList<>();
        for (Animal pet : pets) {
            results.addAll(medicalRecordRepository.findByAnimalId(pet.getId()));
        }
        return results;
    }
}
