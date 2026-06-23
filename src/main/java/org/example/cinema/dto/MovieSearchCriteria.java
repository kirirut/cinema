package org.example.cinema.dto;

public record MovieSearchCriteria(
        String q,
        Long genreId,
        Long countryId,
        Long tagId,
        Long directorId,
        Long actorId,
        Short yearFrom,
        Short yearTo
) {
}
