package org.example.dao;

import org.example.config.DatabaseConfig;
import org.example.exception.DataAccessException;
import org.example.model.Movie;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class MovieDao {

    private static final String INSERT = """
            INSERT INTO movies (title, original_title, description, release_year, duration_minutes,
                                poster_url, trailer_url, age_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """;

    private static final String SELECT_ALL = """
            SELECT id, title, original_title, description, release_year, duration_minutes,
                   poster_url, trailer_url, age_rating, created_at, updated_at
            FROM movies
            ORDER BY id
            """;

    private static final String SELECT_BY_ID = SELECT_ALL.replace("ORDER BY id", "WHERE id = ?");

    private static final String UPDATE = """
            UPDATE movies
            SET title = ?, original_title = ?, description = ?, release_year = ?,
                duration_minutes = ?, poster_url = ?, trailer_url = ?, age_rating = ?
            WHERE id = ?
            """;

    private static final String DELETE = "DELETE FROM movies WHERE id = ?";

    public Movie create(Movie movie) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            bindMovie(statement, movie);
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    movie.setId(keys.getLong(1));
                }
            }
            return findById(movie.getId()).orElse(movie);
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка создания фильма", e);
        }
    }

    public List<Movie> findAll() {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            List<Movie> movies = new ArrayList<>();
            while (resultSet.next()) {
                movies.add(mapRow(resultSet));
            }
            return movies;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка получения списка фильмов", e);
        }
    }

    public Optional<Movie> findById(long id) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_BY_ID)) {
            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(mapRow(resultSet));
                }
                return Optional.empty();
            }
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка поиска фильма по id", e);
        }
    }

    public boolean update(Movie movie) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE)) {
            bindMovie(statement, movie);
            statement.setLong(9, movie.getId());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка обновления фильма", e);
        }
    }

    public boolean delete(long id) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE)) {
            statement.setLong(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка удаления фильма", e);
        }
    }

    private void bindMovie(PreparedStatement statement, Movie movie) throws SQLException {
        statement.setString(1, movie.getTitle());
        statement.setString(2, movie.getOriginalTitle());
        statement.setString(3, movie.getDescription());
        setInteger(statement, 4, movie.getReleaseYear());
        setInteger(statement, 5, movie.getDurationMinutes());
        statement.setString(6, movie.getPosterUrl());
        statement.setString(7, movie.getTrailerUrl());
        statement.setString(8, movie.getAgeRating());
    }

    private Movie mapRow(ResultSet resultSet) throws SQLException {
        Movie movie = new Movie();
        movie.setId(resultSet.getLong("id"));
        movie.setTitle(resultSet.getString("title"));
        movie.setOriginalTitle(resultSet.getString("original_title"));
        movie.setDescription(resultSet.getString("description"));
        movie.setReleaseYear(getInteger(resultSet, "release_year"));
        movie.setDurationMinutes(getInteger(resultSet, "duration_minutes"));
        movie.setPosterUrl(resultSet.getString("poster_url"));
        movie.setTrailerUrl(resultSet.getString("trailer_url"));
        movie.setAgeRating(resultSet.getString("age_rating"));
        Timestamp createdAt = resultSet.getTimestamp("created_at");
        if (createdAt != null) {
            movie.setCreatedAt(createdAt.toLocalDateTime());
        }
        Timestamp updatedAt = resultSet.getTimestamp("updated_at");
        if (updatedAt != null) {
            movie.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        return movie;
    }

    private void setInteger(PreparedStatement statement, int index, Integer value) throws SQLException {
        if (value == null) {
            statement.setNull(index, Types.INTEGER);
        } else {
            statement.setInt(index, value);
        }
    }

    private Integer getInteger(ResultSet resultSet, String column) throws SQLException {
        int value = resultSet.getInt(column);
        return resultSet.wasNull() ? null : value;
    }
}
