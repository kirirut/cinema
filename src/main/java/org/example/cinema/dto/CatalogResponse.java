package org.example.cinema.dto;

import java.util.List;

public record CatalogResponse(
        List<GenreResponse> genres,
        List<CountryResponse> countries,
        List<TagResponse> tags,
        List<RoleResponse> roles
) {
}
