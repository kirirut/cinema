package org.example.cinema.service;

import org.example.cinema.dto.ReviewRequest;
import org.example.cinema.dto.ReviewResponse;
import org.example.cinema.entity.Movie;
import org.example.cinema.entity.Review;
import org.example.cinema.entity.User;
import org.example.cinema.exception.ConflictException;
import org.example.cinema.exception.ResourceNotFoundException;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieService movieService;
    private final CurrentUserService currentUserService;

    public ReviewService(
            ReviewRepository reviewRepository,
            MovieService movieService,
            CurrentUserService currentUserService
    ) {
        this.reviewRepository = reviewRepository;
        this.movieService = movieService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> findByMovieId(Long movieId) {
        movieService.getEntity(movieId);
        return reviewRepository.findByMovie_IdOrderByCreatedAtDesc(movieId).stream()
                .map(EntityMapper::toReviewResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse create(Long movieId, ReviewRequest request) {
        User user = currentUserService.getCurrentUser();
        Movie movie = movieService.getEntity(movieId);

        if (reviewRepository.findByUser_IdAndMovie_Id(user.getId(), movieId).isPresent()) {
            throw new ConflictException("You already reviewed this movie");
        }

        Review review = new Review();
        review.setUser(user);
        review.setMovie(movie);
        review.setTitle(request.title());
        review.setBody(request.body());
        return EntityMapper.toReviewResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse update(Long reviewId, ReviewRequest request) {
        Review review = getOwnedReview(reviewId);
        review.setTitle(request.title());
        review.setBody(request.body());
        return EntityMapper.toReviewResponse(reviewRepository.save(review));
    }

    @Transactional
    public void delete(Long reviewId) {
        Review review = getOwnedReview(reviewId);
        reviewRepository.delete(review);
    }

    private Review getOwnedReview(Long reviewId) {
        User user = currentUserService.getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
        if (!review.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Review not found: " + reviewId);
        }
        return review;
    }
}
