package org.example.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ActorRequest(
        @NotBlank @Size(max = 200) String fullName,
        LocalDate birthDate,
        String bio,
        @Size(max = 500) String photoUrl
) {
}
