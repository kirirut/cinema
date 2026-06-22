package org.example.cinema.dto;

import java.time.Instant;
import java.util.List;

public record MovieDetailResponse(
        Long id,
        String title,
        String originalTitle,
        String description,
        Short releaseYear,
        Short durationMinutes,
        String posterUrl,
        String trailerUrl,
        String ageRating,
        Double averageRating,
        Long ratingsCount,
        List<GenreResponse> genres,
        List<CountryResponse> countries,
        List<DirectorResponse> directors,
        List<TagResponse> tags,
        List<MovieCastResponse> cast,
        Instant createdAt,
        Instant updatedAt
) {
}
