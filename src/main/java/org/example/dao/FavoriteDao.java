package org.example.dao;

import org.example.config.DatabaseConfig;
import org.example.exception.DataAccessException;
import org.example.model.Favorite;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class FavoriteDao {

    private static final String INSERT = """
            INSERT INTO favorites (user_id, movie_id)
            VALUES (?, ?)
            """;

    private static final String SELECT_ALL = """
            SELECT user_id, movie_id, added_at
            FROM favorites
            ORDER BY added_at DESC
            """;

    private static final String DELETE = """
            DELETE FROM favorites
            WHERE user_id = ? AND movie_id = ?
            """;

    public Favorite create(Favorite favorite) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT)) {
            statement.setLong(1, favorite.getUserId());
            statement.setLong(2, favorite.getMovieId());
            statement.executeUpdate();
            return favorite;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка добавления в избранное", e);
        }
    }

    public List<Favorite> findAll() {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            List<Favorite> favorites = new ArrayList<>();
            while (resultSet.next()) {
                favorites.add(mapRow(resultSet));
            }
            return favorites;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка получения избранного", e);
        }
    }

    public boolean delete(long userId, long movieId) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE)) {
            statement.setLong(1, userId);
            statement.setLong(2, movieId);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка удаления из избранного", e);
        }
    }

    private Favorite mapRow(ResultSet resultSet) throws SQLException {
        Favorite favorite = new Favorite();
        favorite.setUserId(resultSet.getLong("user_id"));
        favorite.setMovieId(resultSet.getLong("movie_id"));
        Timestamp addedAt = resultSet.getTimestamp("added_at");
        if (addedAt != null) {
            favorite.setAddedAt(addedAt.toLocalDateTime());
        }
        return favorite;
    }
}
