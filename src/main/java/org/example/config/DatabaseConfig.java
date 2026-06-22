package org.example.config;

import org.example.exception.DataAccessException;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public final class DatabaseConfig {

    private static final String PROPERTIES_FILE = "application.properties";
    private static final Properties PROPERTIES = loadProperties();

    private DatabaseConfig() {
    }

    public static Connection getConnection() {
        try {
            return DriverManager.getConnection(
                    PROPERTIES.getProperty("db.url"),
                    PROPERTIES.getProperty("db.username"),
                    PROPERTIES.getProperty("db.password")
            );
        } catch (SQLException e) {
            throw new DataAccessException(
                    "Не удалось подключиться к базе данных: " + e.getMessage(), e);
        }
    }

    private static Properties loadProperties() {
        Properties properties = new Properties();
        loadFile(properties, PROPERTIES_FILE);
        loadFile(properties, "application-local.properties");
        return properties;
    }

    private static void loadFile(Properties properties, String fileName) {
        try (InputStream input = DatabaseConfig.class.getClassLoader().getResourceAsStream(fileName)) {
            if (input == null) {
                if (PROPERTIES_FILE.equals(fileName)) {
                    throw new DataAccessException("Файл " + fileName + " не найден", null);
                }
                return;
            }
            properties.load(input);
        } catch (IOException e) {
            throw new DataAccessException("Не удалось загрузить " + fileName, e);
        }
    }
}
