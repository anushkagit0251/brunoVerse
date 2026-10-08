package com.brunoverse.repository;

import com.brunoverse.entity.HelpProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HelpProviderRepository extends JpaRepository<HelpProvider, Long> {
    List<HelpProvider> findByTypeIgnoreCase(String type);

    @Query("SELECT h FROM HelpProvider h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(h.address) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(h.type) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<HelpProvider> searchProviders(@Param("q") String q);
}
