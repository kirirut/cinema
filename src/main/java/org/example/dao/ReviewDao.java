package org.example.dao;

import org.example.config.DatabaseConfig;
import org.example.exception.DataAccessException;
import org.example.model.Review;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ReviewDao {

    private static final String INSERT = """
            INSERT INTO reviews (user_id, movie_id, title, body)
            VALUES (?, ?, ?, ?)
            """;

    private static final String SELECT_ALL = """
            SELECT id, user_id, movie_id, title, body, created_at, updated_at
            FROM reviews
            ORDER BY id
            """;

    private static final String SELECT_BY_ID = SELECT_ALL.replace("ORDER BY id", "WHERE id = ?");

    private static final String UPDATE = """
            UPDATE reviews
            SET user_id = ?, movie_id = ?, title = ?, body = ?
            WHERE id = ?
            """;

    private static final String DELETE = "DELETE FROM reviews WHERE id = ?";

    public Review create(Review review) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            statement.setLong(1, review.getUserId());
            statement.setLong(2, review.getMovieId());
            statement.setString(3, review.getTitle());
            statement.setString(4, review.getBody());
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    review.setId(keys.getLong(1));
                }
            }
            return findById(review.getId()).orElse(review);
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка создания отзыва", e);
        }
    }

    public List<Review> findAll() {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            List<Review> reviews = new ArrayList<>();
            while (resultSet.next()) {
                reviews.add(mapRow(resultSet));
            }
            return reviews;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка получения списка отзывов", e);
        }
    }

    public Optional<Review> findById(long id) {
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
            throw new DataAccessException("Ошибка поиска отзыва по id", e);
        }
    }

    public boolean update(Review review) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE)) {
            statement.setLong(1, review.getUserId());
            statement.setLong(2, review.getMovieId());
            statement.setString(3, review.getTitle());
            statement.setString(4, review.getBody());
            statement.setLong(5, review.getId());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка обновления отзыва", e);
        }
    }

    public boolean delete(long id) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE)) {
            statement.setLong(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка удаления отзыва", e);
        }
    }

    private Review mapRow(ResultSet resultSet) throws SQLException {
        Review review = new Review();
        review.setId(resultSet.getLong("id"));
        review.setUserId(resultSet.getLong("user_id"));
        review.setMovieId(resultSet.getLong("movie_id"));
        review.setTitle(resultSet.getString("title"));
        review.setBody(resultSet.getString("body"));
        Timestamp createdAt = resultSet.getTimestamp("created_at");
        if (createdAt != null) {
            review.setCreatedAt(createdAt.toLocalDateTime());
        }
        Timestamp updatedAt = resultSet.getTimestamp("updated_at");
        if (updatedAt != null) {
            review.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        return review;
    }
}
