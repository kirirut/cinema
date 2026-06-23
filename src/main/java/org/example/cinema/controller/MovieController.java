package org.example.cinema.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.cinema.dto.MovieDetailResponse;
import org.example.cinema.dto.MovieRequest;
import org.example.cinema.dto.MovieSearchCriteria;
import org.example.cinema.dto.MovieSummaryResponse;
import org.example.cinema.dto.PageResponse;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movies")
@Tag(name = "Movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    @Operation(summary = "Search and filter movies with pagination")
    public PageResponse<MovieSummaryResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long genreId,
            @RequestParam(required = false) Long countryId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) Long directorId,
            @RequestParam(required = false) Long actorId,
            @RequestParam(required = false) Short yearFrom,
            @RequestParam(required = false) Short yearTo,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return movieService.search(
                new MovieSearchCriteria(q, genreId, countryId, tagId, directorId, actorId, yearFrom, yearTo),
                pageable
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get movie details with all relations")
    public MovieDetailResponse findById(@PathVariable Long id) {
        return movieService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create movie (admin)")
    public MovieDetailResponse create(@Valid @RequestBody MovieRequest request) {
        return movieService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update movie (admin)")
    public MovieDetailResponse update(@PathVariable Long id, @Valid @RequestBody MovieRequest request) {
        return movieService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete movie (admin)")
    public void delete(@PathVariable Long id) {
        movieService.delete(id);
    }
}
