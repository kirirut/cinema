package org.example.cinema.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.cinema.dto.CountryRequest;
import org.example.cinema.dto.CountryResponse;
import org.example.cinema.dto.MovieSummaryResponse;
import org.example.cinema.dto.PageResponse;
import org.example.cinema.service.CountryService;
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
@RequestMapping("/api/countries")
@Tag(name = "Countries")
public class CountryController {

    private final CountryService countryService;
    private final MovieService movieService;

    public CountryController(CountryService countryService, MovieService movieService) {
        this.countryService = countryService;
        this.movieService = movieService;
    }

    @GetMapping
    @Operation(summary = "List all countries")
    public List<CountryResponse> findAll() {
        return countryService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get country by id")
    public CountryResponse findById(@PathVariable Long id) {
        return countryService.findById(id);
    }

    @GetMapping("/{id}/movies")
    @Operation(summary = "Movies from country")
    public PageResponse<MovieSummaryResponse> movies(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return movieService.findByCountryId(id, pageable);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create country (admin)")
    public CountryResponse create(@Valid @RequestBody CountryRequest request) {
        return countryService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update country (admin)")
    public CountryResponse update(@PathVariable Long id, @Valid @RequestBody CountryRequest request) {
        return countryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete country (admin)")
    public void delete(@PathVariable Long id) {
        countryService.delete(id);
    }
}
