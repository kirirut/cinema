package org.example.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GenreRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100) String slug
) {
}
