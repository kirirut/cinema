package org.example.cinema.repository;

import org.example.cinema.entity.Director;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DirectorRepository extends JpaRepository<Director, Long> {

    Page<Director> findByFullNameContainingIgnoreCase(String name, Pageable pageable);
}
