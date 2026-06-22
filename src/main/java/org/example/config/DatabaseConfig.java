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
    private static final String SECRETS_FILE = "application-secrets.properties";
    private static final Properties PROPERTIES = loadProperties();

    private DatabaseConfig() {
    }

    public static Connection getConnection() {
        String url = requireProperty("db.url", "DB_URL");
        String username = requireProperty("db.username", "DB_USERNAME");
        String password = requireProperty("db.password", "DB_PASSWORD");

        try {
            return DriverManager.getConnection(url, username, password);
        } catch (SQLException e) {
            throw new DataAccessException(
                    "Не удалось подключиться к базе данных: " + e.getMessage(), e);
        }
    }

    private static Properties loadProperties() {
        Properties properties = new Properties();
        loadFile(properties, PROPERTIES_FILE);
        loadFile(properties, SECRETS_FILE);
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

    private static String requireProperty(String propertyKey, String envKey) {
        String envValue = System.getenv(envKey);
        if (envValue != null && !envValue.isBlank()) {
            return envValue.trim();
        }

        String systemValue = System.getProperty(propertyKey);
        if (systemValue != null && !systemValue.isBlank()) {
            return systemValue.trim();
        }

        String fileValue = PROPERTIES.getProperty(propertyKey);
        if (fileValue != null && !fileValue.isBlank()) {
            return fileValue.trim();
        }

        throw new DataAccessException(
                "Не задан параметр " + propertyKey + ". "
                        + "Укажите переменную окружения " + envKey
                        + " или добавьте значение в " + SECRETS_FILE,
                null
        );
    }
}
