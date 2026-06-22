package org.example.cinema.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.cinema.dto.MovieSummaryResponse;
import org.example.cinema.dto.PageResponse;
import org.example.cinema.dto.TagRequest;
import org.example.cinema.dto.TagResponse;
import org.example.cinema.service.MovieService;
import org.example.cinema.service.TagService;
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
@RequestMapping("/api/tags")
@Tag(name = "Tags")
public class TagController {

    private final TagService tagService;
    private final MovieService movieService;

    public TagController(TagService tagService, MovieService movieService) {
        this.tagService = tagService;
        this.movieService = movieService;
    }

    @GetMapping
    @Operation(summary = "List all tags")
    public List<TagResponse> findAll() {
        return tagService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tag by id")
    public TagResponse findById(@PathVariable Long id) {
        return tagService.findById(id);
    }

    @GetMapping("/{id}/movies")
    @Operation(summary = "Movies with tag")
    public PageResponse<MovieSummaryResponse> movies(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return movieService.findByTagId(id, pageable);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create tag (admin)")
    public TagResponse create(@Valid @RequestBody TagRequest request) {
        return tagService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update tag (admin)")
    public TagResponse update(@PathVariable Long id, @Valid @RequestBody TagRequest request) {
        return tagService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete tag (admin)")
    public void delete(@PathVariable Long id) {
        tagService.delete(id);
    }
}
