package org.example.cinema.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record AdminUserUpdateRequest(
        @Email @Size(max = 255) String email,
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @Size(min = 6, max = 100) String password,
        Set<String> roles,
        Boolean active
) {
}
