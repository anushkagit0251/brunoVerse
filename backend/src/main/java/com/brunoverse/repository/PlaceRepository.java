package com.brunoverse.repository;

import com.brunoverse.model.Place;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, String> {
    List<Place> findByType(String type);
}
