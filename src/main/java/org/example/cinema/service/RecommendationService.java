package org.example.cinema.service;

import org.example.cinema.dto.MovieSummaryResponse;
import org.example.cinema.entity.User;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.MovieRepository;
import org.example.cinema.repository.RatingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RecommendationService {

    private static final int LIMIT = 20;
    private static final short MIN_LIKED_SCORE = 4;

    private final MovieRepository movieRepository;
    private final RatingRepository ratingRepository;
    private final CurrentUserService currentUserService;

    public RecommendationService(
            MovieRepository movieRepository,
            RatingRepository ratingRepository,
            CurrentUserService currentUserService
    ) {
        this.movieRepository = movieRepository;
        this.ratingRepository = ratingRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> recommendForCurrentUser() {
        User user = currentUserService.getCurrentUser();
        List<Long> genreIds = ratingRepository.findPreferredGenreIdsByUser(user.getId(), MIN_LIKED_SCORE);
        if (genreIds.isEmpty()) {
            return List.of();
        }

        List<Long> ratedMovieIds = ratingRepository.findRatedMovieIdsByUser(user.getId());
        return movieRepository.findRecommended(genreIds, ratedMovieIds, LIMIT).stream()
                .map(EntityMapper::toMovieSummaryResponse)
                .toList();
    }
}
