package org.example.dao;

import org.example.config.DatabaseConfig;
import org.example.exception.DataAccessException;
import org.example.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class UserDao {

    private static final String INSERT = """
            INSERT INTO users (username, email, password_hash, first_name, last_name, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
            """;

    private static final String SELECT_ALL = """
            SELECT id, username, email, password_hash, first_name, last_name, is_active, created_at, updated_at
            FROM users
            ORDER BY id
            """;

    private static final String SELECT_BY_ID = SELECT_ALL.replace("ORDER BY id", "WHERE id = ?");

    private static final String UPDATE = """
            UPDATE users
            SET username = ?, email = ?, password_hash = ?, first_name = ?, last_name = ?, is_active = ?
            WHERE id = ?
            """;

    private static final String DELETE = "DELETE FROM users WHERE id = ?";

    public User create(User user) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            bindUser(statement, user);
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    user.setId(keys.getLong(1));
                }
            }
            return findById(user.getId()).orElse(user);
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка создания пользователя", e);
        }
    }

    public List<User> findAll() {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            List<User> users = new ArrayList<>();
            while (resultSet.next()) {
                users.add(mapRow(resultSet));
            }
            return users;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка получения списка пользователей", e);
        }
    }

    public Optional<User> findById(long id) {
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
            throw new DataAccessException("Ошибка поиска пользователя по id", e);
        }
    }

    public boolean update(User user) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE)) {
            bindUser(statement, user);
            statement.setLong(7, user.getId());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка обновления пользователя", e);
        }
    }

    public boolean delete(long id) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE)) {
            statement.setLong(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DataAccessException("Ошибка удаления пользователя", e);
        }
    }

    private void bindUser(PreparedStatement statement, User user) throws SQLException {
        statement.setString(1, user.getUsername());
        statement.setString(2, user.getEmail());
        statement.setString(3, user.getPasswordHash());
        statement.setString(4, user.getFirstName());
        statement.setString(5, user.getLastName());
        statement.setBoolean(6, user.isActive());
    }

    private User mapRow(ResultSet resultSet) throws SQLException {
        User user = new User();
        user.setId(resultSet.getLong("id"));
        user.setUsername(resultSet.getString("username"));
        user.setEmail(resultSet.getString("email"));
        user.setPasswordHash(resultSet.getString("password_hash"));
        user.setFirstName(resultSet.getString("first_name"));
        user.setLastName(resultSet.getString("last_name"));
        user.setActive(resultSet.getBoolean("is_active"));
        Timestamp createdAt = resultSet.getTimestamp("created_at");
        if (createdAt != null) {
            user.setCreatedAt(createdAt.toLocalDateTime());
        }
        Timestamp updatedAt = resultSet.getTimestamp("updated_at");
        if (updatedAt != null) {
            user.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        return user;
    }
}
