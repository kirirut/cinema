package org.example.cinema.repository;

import org.example.cinema.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie>, MovieRepositoryCustom {

    @EntityGraph(attributePaths = "genres")
    Page<Movie> findAll(Specification<Movie> spec, Pageable pageable);

    @Query("""
            SELECT DISTINCT m FROM Movie m
            LEFT JOIN FETCH m.genres
            WHERE m.id IN :ids
            """)
    List<Movie> findAllWithGenresByIdIn(@Param("ids") List<Long> ids);

    @Query("""
            SELECT DISTINCT m FROM Movie m
            JOIN m.cast c
            WHERE c.actor.id = :actorId
            """)
    Page<Movie> findByActorId(@Param("actorId") Long actorId, Pageable pageable);

    @Query("""
            SELECT DISTINCT m FROM Movie m
            JOIN m.directors d
            WHERE d.id = :directorId
            """)
    Page<Movie> findByDirectorId(@Param("directorId") Long directorId, Pageable pageable);

    @Query("""
            SELECT DISTINCT m FROM Movie m
            JOIN m.countries c
            WHERE c.id = :countryId
            """)
    Page<Movie> findByCountryId(@Param("countryId") Long countryId, Pageable pageable);

    @Query("""
            SELECT DISTINCT m FROM Movie m
            JOIN m.genres g
            WHERE g.id = :genreId
            """)
    Page<Movie> findByGenreId(@Param("genreId") Long genreId, Pageable pageable);

    @Query("""
            SELECT DISTINCT m FROM Movie m
            JOIN m.tags t
            WHERE t.id = :tagId
            """)
    Page<Movie> findByTagId(@Param("tagId") Long tagId, Pageable pageable);
}
