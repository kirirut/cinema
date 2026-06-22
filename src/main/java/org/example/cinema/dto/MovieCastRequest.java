package org.example.cinema.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MovieCastRequest(
        @NotNull Long actorId,
        @Size(max = 200) String roleName
) {
}
