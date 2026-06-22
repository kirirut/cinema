package org.example.cinema.dto;

import java.time.Instant;
import java.util.List;

public record MovieSummaryResponse(
        Long id,
        String title,
        String originalTitle,
        Short releaseYear,
        String posterUrl,
        String ageRating,
        Double averageRating,
        Long ratingsCount,
        List<GenreResponse> genres
) {
}
