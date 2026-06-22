package org.example.cinema.dto;

import java.time.Instant;
import java.time.LocalDate;

public record DirectorResponse(
        Long id,
        String fullName,
        LocalDate birthDate,
        String bio,
        String photoUrl,
        Instant createdAt
) {
}
