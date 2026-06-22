package org.example.cinema.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.example.cinema.entity.Movie;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class MovieRepositoryImpl implements MovieRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Movie> findRecommended(List<Long> genreIds, List<Long> excludeMovieIds, int limit) {
        StringBuilder jpql = new StringBuilder("""
                SELECT m.id FROM Movie m
                JOIN m.genres g
                WHERE g.id IN :genreIds
                """);
        if (!excludeMovieIds.isEmpty()) {
            jpql.append(" AND m.id NOT IN :excludeMovieIds ");
        }
        jpql.append("""
                GROUP BY m.id
                ORDER BY (
                    SELECT COALESCE(AVG(r.score), 0.0) FROM Rating r WHERE r.movie = m
                ) DESC, m.id
                """);

        TypedQuery<Long> idQuery = entityManager.createQuery(jpql.toString(), Long.class);
        idQuery.setParameter("genreIds", genreIds);
        if (!excludeMovieIds.isEmpty()) {
            idQuery.setParameter("excludeMovieIds", excludeMovieIds);
        }
        idQuery.setMaxResults(limit);

        List<Long> ids = idQuery.getResultList();
        if (ids.isEmpty()) {
            return List.of();
        }

        List<Movie> movies = entityManager.createQuery("""
                        SELECT DISTINCT m FROM Movie m
                        LEFT JOIN FETCH m.genres
                        WHERE m.id IN :ids
                        """, Movie.class)
                .setParameter("ids", ids)
                .getResultList();

        Map<Long, Movie> moviesById = movies.stream()
                .collect(Collectors.toMap(Movie::getId, Function.identity()));

        return ids.stream()
                .map(moviesById::get)
                .filter(Objects::nonNull)
                .toList();
    }
}
