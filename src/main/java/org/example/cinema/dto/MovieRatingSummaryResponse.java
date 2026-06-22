package org.example.cinema.dto;

public record MovieRatingSummaryResponse(Long movieId, Double averageRating, Long ratingsCount) {
}
