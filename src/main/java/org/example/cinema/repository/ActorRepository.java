package org.example.cinema.repository;

import org.example.cinema.entity.Actor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActorRepository extends JpaRepository<Actor, Long> {

    Page<Actor> findByFullNameContainingIgnoreCase(String name, Pageable pageable);
}
