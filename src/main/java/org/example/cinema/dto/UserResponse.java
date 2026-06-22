package org.example.cinema.dto;

import java.util.Set;

public record UserResponse(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        Set<String> roles,
        boolean active
) {
}
