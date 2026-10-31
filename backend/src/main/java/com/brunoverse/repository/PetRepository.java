package com.brunoverse.repository;

import com.brunoverse.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PetRepository extends JpaRepository<Pet, String> {
    List<Pet> findByOwnerId(String ownerId);
}
