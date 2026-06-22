package org.example.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CountryRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(min = 2, max = 2) String isoCode
) {
}
