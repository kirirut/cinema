package org.example.cinema.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.cinema.dto.DirectorRequest;
import org.example.cinema.dto.DirectorResponse;
import org.example.cinema.dto.MovieSummaryResponse;
import org.example.cinema.dto.PageResponse;
import org.example.cinema.service.DirectorService;
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
@RequestMapping("/api/directors")
@Tag(name = "Directors")
public class DirectorController {

    private final DirectorService directorService;
    private final MovieService movieService;

    public DirectorController(DirectorService directorService, MovieService movieService) {
        this.directorService = directorService;
        this.movieService = movieService;
    }

    @GetMapping
    @Operation(summary = "List directors with optional search")
    public PageResponse<DirectorResponse> findAll(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return directorService.findAll(q, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get director by id")
    public DirectorResponse findById(@PathVariable Long id) {
        return directorService.findById(id);
    }

    @GetMapping("/{id}/movies")
    @Operation(summary = "Movies by director")
    public PageResponse<MovieSummaryResponse> movies(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return movieService.findByDirectorId(id, pageable);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create director (admin)")
    public DirectorResponse create(@Valid @RequestBody DirectorRequest request) {
        return directorService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update director (admin)")
    public DirectorResponse update(@PathVariable Long id, @Valid @RequestBody DirectorRequest request) {
        return directorService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete director (admin)")
    public void delete(@PathVariable Long id) {
        directorService.delete(id);
    }
}
