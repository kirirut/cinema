package org.example.cinema.dto;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long userId,
        String username,
        Long movieId,
        String title,
        String body,
        Instant createdAt,
        Instant updatedAt
) {
}
