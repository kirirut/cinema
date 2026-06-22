package org.example.dao;

import org.example.config.DatabaseConfig;
import org.example.exception.DataAccessException;
import org.example.model.Genre;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class GenreDao {

    private static final String INSERT = "INSERT INTO genres (name, slug) VALUES (?, ?)";

    private static final String SELECT_ALL = "SELECT id, name, slug FROM genres ORDER BY id";

    private static final String SELECT_BY_ID = "SELECT id, name, slug FROM genres WHERE id = ?";

    private static final String UPDATE = "UPDATE genres SET name = ?, slug = ? WHERE id = ?";

    private static final String DELETE = "DELETE FROM genres WHERE id = ?";

    public Genre create(Genre genre) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, genre.getName());
            statement.setString(2, genre.getSlug());
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    genre.setId(keys.getLong(1));
                }
            }
            return genre;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка создания жанра", e);
        }
    }

    public List<Genre> findAll() {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            List<Genre> genres = new ArrayList<>();
            while (resultSet.next()) {
                genres.add(mapRow(resultSet));
            }
            return genres;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка получения списка жанров", e);
        }
    }

    public Optional<Genre> findById(long id) {
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
            throw new DataAccessException("Ошибка поиска жанра по id", e);
        }
    }

    public boolean update(Genre genre) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE)) {
            statement.setString(1, genre.getName());
            statement.setString(2, genre.getSlug());
            statement.setLong(3, genre.getId());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка обновления жанра", e);
        }
    }

    public boolean delete(long id) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE)) {
            statement.setLong(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка удаления жанра", e);
        }
    }

    private Genre mapRow(ResultSet resultSet) throws SQLException {
        Genre genre = new Genre();
        genre.setId(resultSet.getLong("id"));
        genre.setName(resultSet.getString("name"));
        genre.setSlug(resultSet.getString("slug"));
        return genre;
    }
}
