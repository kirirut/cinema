package org.example.cinema.repository;

import org.example.cinema.entity.Movie;
import org.springframework.data.jpa.domain.Specification;

public final class MovieSpecifications {

    private MovieSpecifications() {
    }

    public static Specification<Movie> titleContains(String query) {
        return (root, q, cb) -> {
            if (query == null || query.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("title")), "%" + query.toLowerCase().trim() + "%");
        };
    }

    public static Specification<Movie> releaseYearFrom(Short yearFrom) {
        return (root, q, cb) -> yearFrom == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("releaseYear"), yearFrom);
    }

    public static Specification<Movie> releaseYearTo(Short yearTo) {
        return (root, q, cb) -> yearTo == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("releaseYear"), yearTo);
    }

    public static Specification<Movie> hasGenreId(Long genreId) {
        return (root, q, cb) -> {
            if (genreId == null) {
                return cb.conjunction();
            }
            q.distinct(true);
            return cb.equal(root.join("genres").get("id"), genreId);
        };
    }

    public static Specification<Movie> hasCountryId(Long countryId) {
        return (root, q, cb) -> {
            if (countryId == null) {
                return cb.conjunction();
            }
            q.distinct(true);
            return cb.equal(root.join("countries").get("id"), countryId);
        };
    }

    public static Specification<Movie> hasTagId(Long tagId) {
        return (root, q, cb) -> {
            if (tagId == null) {
                return cb.conjunction();
            }
            q.distinct(true);
            return cb.equal(root.join("tags").get("id"), tagId);
        };
    }

    public static Specification<Movie> hasDirectorId(Long directorId) {
        return (root, q, cb) -> {
            if (directorId == null) {
                return cb.conjunction();
            }
            q.distinct(true);
            return cb.equal(root.join("directors").get("id"), directorId);
        };
    }

    public static Specification<Movie> hasActorId(Long actorId) {
        return (root, q, cb) -> {
            if (actorId == null) {
                return cb.conjunction();
            }
            q.distinct(true);
            return cb.equal(root.join("cast").get("actor").get("id"), actorId);
        };
    }
}
