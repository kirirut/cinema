package org.example.cinema.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.cinema.dto.ReviewRequest;
import org.example.cinema.dto.ReviewResponse;
import org.example.cinema.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/movies/{movieId}/reviews")
@Tag(name = "Reviews")
public class MovieReviewController {

    private final ReviewService reviewService;

    public MovieReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @Operation(summary = "List reviews for a movie")
    public List<ReviewResponse> findByMovie(@PathVariable Long movieId) {
        return reviewService.findByMovieId(movieId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a review for a movie")
    public ReviewResponse create(@PathVariable Long movieId, @Valid @RequestBody ReviewRequest request) {
        return reviewService.create(movieId, request);
    }
}
