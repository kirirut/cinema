package org.example.cinema.service;



import org.example.cinema.dto.MovieRatingSummaryResponse;

import org.example.cinema.dto.RatingRequest;

import org.example.cinema.dto.RatingResponse;

import org.example.cinema.entity.Movie;

import org.example.cinema.entity.Rating;

import org.example.cinema.entity.User;

import org.example.cinema.exception.ResourceNotFoundException;

import org.example.cinema.mapper.EntityMapper;

import org.example.cinema.repository.RatingRepository;

import org.springframework.cache.annotation.CacheEvict;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;



import java.util.List;



@Service

public class RatingService {



    private final RatingRepository ratingRepository;

    private final MovieService movieService;

    private final CurrentUserService currentUserService;



    public RatingService(

            RatingRepository ratingRepository,

            MovieService movieService,

            CurrentUserService currentUserService

    ) {

        this.ratingRepository = ratingRepository;

        this.movieService = movieService;

        this.currentUserService = currentUserService;

    }



    @Transactional(readOnly = true)

    public List<RatingResponse> findByMovieId(Long movieId) {

        movieService.getEntity(movieId);

        return ratingRepository.findByMovie_Id(movieId).stream()

                .map(EntityMapper::toRatingResponse)

                .toList();

    }



    @Transactional(readOnly = true)

    public MovieRatingSummaryResponse getSummary(Long movieId) {

        Movie movie = movieService.getEntity(movieId);

        Long count = movie.getRatingsCount();

        return new MovieRatingSummaryResponse(

                movieId,

                movie.getAverageRating(),

                count == null ? 0L : count

        );

    }



    @Transactional

    @CacheEvict(value = {"movies", "movie"}, allEntries = true)

    public RatingResponse rate(Long movieId, RatingRequest request) {

        User user = currentUserService.getCurrentUser();

        Movie movie = movieService.getEntity(movieId);



        Rating rating = ratingRepository.findByUser_IdAndMovie_Id(user.getId(), movieId)

                .orElseGet(() -> {

                    Rating r = new Rating();

                    r.setUser(user);

                    r.setMovie(movie);

                    return r;

                });



        if (rating.getId() != null && rating.getScore() == request.score()) {

            return EntityMapper.toRatingResponse(rating);

        }



        rating.setScore(request.score());

        return EntityMapper.toRatingResponse(ratingRepository.save(rating));

    }



    @Transactional

    @CacheEvict(value = {"movies", "movie"}, allEntries = true)

    public void delete(Long movieId) {

        User user = currentUserService.getCurrentUser();

        Rating rating = ratingRepository.findByUser_IdAndMovie_Id(user.getId(), movieId)

                .orElseThrow(() -> new ResourceNotFoundException("Rating not found"));

        ratingRepository.delete(rating);

    }



    @Transactional(readOnly = true)

    public RatingResponse findMyRating(Long movieId) {

        User user = currentUserService.getCurrentUser();

        return ratingRepository.findByUser_IdAndMovie_Id(user.getId(), movieId)

                .map(EntityMapper::toRatingResponse)

                .orElseThrow(() -> new ResourceNotFoundException("Rating not found"));

    }

}

