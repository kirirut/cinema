package org.example.dao;

import org.example.config.DatabaseConfig;
import org.example.exception.DataAccessException;
import org.example.model.Rating;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class RatingDao {

    private static final String INSERT = """
            INSERT INTO ratings (user_id, movie_id, score)
            VALUES (?, ?, ?)
            """;

    private static final String SELECT_ALL = """
            SELECT id, user_id, movie_id, score, created_at, updated_at
            FROM ratings
            ORDER BY id
            """;

    private static final String SELECT_BY_ID = SELECT_ALL.replace("ORDER BY id", "WHERE id = ?");

    private static final String UPDATE = """
            UPDATE ratings
            SET user_id = ?, movie_id = ?, score = ?
            WHERE id = ?
            """;

    private static final String DELETE = "DELETE FROM ratings WHERE id = ?";

    public Rating create(Rating rating) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            statement.setLong(1, rating.getUserId());
            statement.setLong(2, rating.getMovieId());
            statement.setInt(3, rating.getScore());
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    rating.setId(keys.getLong(1));
                }
            }
            return findById(rating.getId()).orElse(rating);
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка создания оценки", e);
        }
    }

    public List<Rating> findAll() {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            List<Rating> ratings = new ArrayList<>();
            while (resultSet.next()) {
                ratings.add(mapRow(resultSet));
            }
            return ratings;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка получения списка оценок", e);
        }
    }

    public Optional<Rating> findById(long id) {
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
            throw new DataAccessException("Ошибка поиска оценки по id", e);
        }
    }

    public boolean update(Rating rating) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE)) {
            statement.setLong(1, rating.getUserId());
            statement.setLong(2, rating.getMovieId());
            statement.setInt(3, rating.getScore());
            statement.setLong(4, rating.getId());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка обновления оценки", e);
        }
    }

    public boolean delete(long id) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE)) {
            statement.setLong(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка удаления оценки", e);
        }
    }

    private Rating mapRow(ResultSet resultSet) throws SQLException {
        Rating rating = new Rating();
        rating.setId(resultSet.getLong("id"));
        rating.setUserId(resultSet.getLong("user_id"));
        rating.setMovieId(resultSet.getLong("movie_id"));
        rating.setScore(resultSet.getInt("score"));
        Timestamp createdAt = resultSet.getTimestamp("created_at");
        if (createdAt != null) {
            rating.setCreatedAt(createdAt.toLocalDateTime());
        }
        Timestamp updatedAt = resultSet.getTimestamp("updated_at");
        if (updatedAt != null) {
            rating.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        return rating;
    }
}
