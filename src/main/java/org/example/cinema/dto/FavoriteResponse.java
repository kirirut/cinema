package org.example.cinema.dto;

import java.time.Instant;

public record FavoriteResponse(Long userId, Long movieId, Instant addedAt, MovieSummaryResponse movie) {
}
