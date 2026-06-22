package org.example.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Set;

public record MovieRequest(
        @NotBlank @Size(max = 255) String title,
        @Size(max = 255) String originalTitle,
        String description,
        Short releaseYear,
        Short durationMinutes,
        @Size(max = 500) String posterUrl,
        @Size(max = 500) String trailerUrl,
        @Size(max = 10) String ageRating,
        Set<Long> genreIds,
        Set<Long> countryIds,
        Set<Long> directorIds,
        Set<Long> tagIds,
        List<MovieCastRequest> cast
) {
}
