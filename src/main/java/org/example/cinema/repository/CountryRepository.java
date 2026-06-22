package org.example.cinema.repository;

import org.example.cinema.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CountryRepository extends JpaRepository<Country, Long> {

    Optional<Country> findByIsoCode(String isoCode);

    boolean existsByName(String name);

    boolean existsByIsoCode(String isoCode);
}
