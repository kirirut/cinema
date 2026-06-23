package org.example.cinema.service;

import org.example.cinema.dto.FavoriteResponse;
import org.example.cinema.dto.MovieSummaryResponse;
import org.example.cinema.entity.Favorite;
import org.example.cinema.entity.Favorite.FavoriteId;
import org.example.cinema.entity.Movie;
import org.example.cinema.entity.User;
import org.example.cinema.exception.ConflictException;
import org.example.cinema.exception.ResourceNotFoundException;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.FavoriteRepository;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final MovieService movieService;
    private final CurrentUserService currentUserService;

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            MovieService movieService,
            CurrentUserService currentUserService
    ) {
        this.favoriteRepository = favoriteRepository;
        this.movieService = movieService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> findMine() {
        User user = currentUserService.getCurrentUser();
        return favoriteRepository.findByUser_IdOrderByAddedAtDesc(user.getId()).stream()
                .map(this::toFavoriteResponse)
                .toList();
    }

    @Transactional
    public FavoriteResponse add(Long movieId) {
        User user = currentUserService.getCurrentUser();
        Movie movie = movieService.getEntity(movieId);

        FavoriteId id = new FavoriteId(user.getId(), movieId);
        if (favoriteRepository.existsById(id)) {
            throw new ConflictException("Movie already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setId(id);
        favorite.setUser(user);
        favorite.setMovie(movie);
        return toFavoriteResponse(favoriteRepository.save(favorite));
    }

    @Transactional
    public void remove(Long movieId) {
        User user = currentUserService.getCurrentUser();
        FavoriteId id = new FavoriteId(user.getId(), movieId);
        if (!favoriteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Favorite not found");
        }
        favoriteRepository.deleteById(id);
    }

    private FavoriteResponse toFavoriteResponse(Favorite favorite) {
        Movie movie = favorite.getMovie();
        Hibernate.initialize(movie.getGenres());
        MovieSummaryResponse movieResponse = EntityMapper.toMovieSummaryResponse(movie);
        return new FavoriteResponse(
                favorite.getUser().getId(),
                movie.getId(),
                favorite.getAddedAt(),
                movieResponse
        );
    }
}
