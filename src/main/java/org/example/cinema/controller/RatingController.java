package org.example.cinema.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.cinema.dto.MovieRatingSummaryResponse;
import org.example.cinema.dto.RatingRequest;
import org.example.cinema.dto.RatingResponse;
import org.example.cinema.service.RatingService;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/movies/{movieId}/ratings")
@Tag(name = "Ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping
    @Operation(summary = "List ratings for a movie")
    public List<RatingResponse> findByMovie(@PathVariable Long movieId) {
        return ratingService.findByMovieId(movieId);
    }

    @GetMapping("/summary")
    @Operation(summary = "Average rating summary for a movie")
    public MovieRatingSummaryResponse summary(@PathVariable Long movieId) {
        return ratingService.getSummary(movieId);
    }

    @GetMapping("/me")
    @Operation(summary = "Current user's rating for a movie")
    public RatingResponse myRating(@PathVariable Long movieId) {
        return ratingService.findMyRating(movieId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Rate a movie (create or update)")
    public RatingResponse rate(@PathVariable Long movieId, @Valid @RequestBody RatingRequest request) {
        return ratingService.rate(movieId, request);
    }

    @PutMapping
    @Operation(summary = "Update current user's rating")
    public RatingResponse update(@PathVariable Long movieId, @Valid @RequestBody RatingRequest request) {
        return ratingService.rate(movieId, request);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove current user's rating")
    public void delete(@PathVariable Long movieId) {
        ratingService.delete(movieId);
    }
}
