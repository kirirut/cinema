package org.example.cinema.dto;

import jakarta.validation.constraints.NotBlank;

public record ReviewRequest(
        String title,
        @NotBlank String body
) {
}
