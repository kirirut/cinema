package org.example.cinema.dto;

import java.time.Instant;

public record RatingResponse(
        Long id,
        Long userId,
        String username,
        Long movieId,
        short score,
        Instant createdAt,
        Instant updatedAt
) {
}
