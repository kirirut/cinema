package org.example.cinema.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.cinema.dto.ActorRequest;
import org.example.cinema.dto.ActorResponse;
import org.example.cinema.dto.MovieSummaryResponse;
import org.example.cinema.dto.PageResponse;
import org.example.cinema.service.ActorService;
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
@RequestMapping("/api/actors")
@Tag(name = "Actors")
public class ActorController {

    private final ActorService actorService;
    private final MovieService movieService;

    public ActorController(ActorService actorService, MovieService movieService) {
        this.actorService = actorService;
        this.movieService = movieService;
    }

    @GetMapping
    @Operation(summary = "List actors with optional search")
    public PageResponse<ActorResponse> findAll(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return actorService.findAll(q, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get actor by id")
    public ActorResponse findById(@PathVariable Long id) {
        return actorService.findById(id);
    }

    @GetMapping("/{id}/movies")
    @Operation(summary = "Movies with actor")
    public PageResponse<MovieSummaryResponse> movies(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return movieService.findByActorId(id, pageable);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create actor (admin)")
    public ActorResponse create(@Valid @RequestBody ActorRequest request) {
        return actorService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update actor (admin)")
    public ActorResponse update(@PathVariable Long id, @Valid @RequestBody ActorRequest request) {
        return actorService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete actor (admin)")
    public void delete(@PathVariable Long id) {
        actorService.delete(id);
    }
}
