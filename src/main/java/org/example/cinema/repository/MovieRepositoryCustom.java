package org.example.cinema.repository;

import org.example.cinema.entity.Movie;

import java.util.List;

public interface MovieRepositoryCustom {

    List<Movie> findRecommended(List<Long> genreIds, List<Long> excludeMovieIds, int limit);
}
