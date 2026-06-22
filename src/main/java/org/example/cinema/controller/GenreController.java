package org.example.cinema.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.cinema.dto.GenreRequest;
import org.example.cinema.dto.GenreResponse;
import org.example.cinema.dto.MovieSummaryResponse;
import org.example.cinema.dto.PageResponse;
import org.example.cinema.service.GenreService;
import org.example.cinema.service.MovieService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@Tag(name = "Genres")
public class GenreController {

    private final GenreService genreService;
    private final MovieService movieService;

    public GenreController(GenreService genreService, MovieService movieService) {
        this.genreService = genreService;
        this.movieService = movieService;
    }

    @GetMapping
    @Operation(summary = "List all genres")
    public List<GenreResponse> findAll() {
        return genreService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get genre by id")
    public GenreResponse findById(@PathVariable Long id) {
        return genreService.findById(id);
    }

    @GetMapping("/{id}/movies")
    @Operation(summary = "Movies in genre")
    public PageResponse<MovieSummaryResponse> movies(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return movieService.findByGenreId(id, pageable);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create genre (admin)")
    public GenreResponse create(@Valid @RequestBody GenreRequest request) {
        return genreService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update genre (admin)")
    public GenreResponse update(@PathVariable Long id, @Valid @RequestBody GenreRequest request) {
        return genreService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete genre (admin)")
    public void delete(@PathVariable Long id) {
        genreService.delete(id);
    }
}
