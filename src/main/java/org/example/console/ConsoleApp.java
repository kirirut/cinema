package org.example.console;

import org.example.dao.FavoriteDao;
import org.example.dao.GenreDao;
import org.example.dao.MovieDao;
import org.example.dao.RatingDao;
import org.example.dao.ReviewDao;
import org.example.dao.UserDao;
import org.example.exception.DataAccessException;
import org.example.model.Favorite;
import org.example.model.Genre;
import org.example.model.Movie;
import org.example.model.Rating;
import org.example.model.Review;
import org.example.model.User;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;
import java.util.function.LongFunction;
import java.util.function.Supplier;

public class ConsoleApp {

    private final Scanner scanner = new Scanner(System.in);
    private final MovieDao movieDao = new MovieDao();
    private final UserDao userDao = new UserDao();
    private final GenreDao genreDao = new GenreDao();
    private final ReviewDao reviewDao = new ReviewDao();
    private final RatingDao ratingDao = new RatingDao();
    private final FavoriteDao favoriteDao = new FavoriteDao();

    public void run() {
        System.out.println("=== Онлайн-кинотеатр (JDBC CRUD) ===");

        boolean running = true;
        while (running) {
            printMainMenu();
            int choice = readInt("Выберите пункт: ");
            try {
                running = switch (choice) {
                    case 1 -> {
                        handleMovies();
                        yield true;
                    }
                    case 2 -> {
                        handleUsers();
                        yield true;
                    }
                    case 3 -> {
                        handleGenres();
                        yield true;
                    }
                    case 4 -> {
                        handleReviews();
                        yield true;
                    }
                    case 5 -> {
                        handleRatings();
                        yield true;
                    }
                    case 6 -> {
                        handleFavorites();
                        yield true;
                    }
                    case 0 -> {
                        System.out.println("Выход.");
                        yield false;
                    }
                    default -> {
                        System.out.println("Неверный пункт меню.");
                        yield true;
                    }
                };
            } catch (DataAccessException e) {
                System.out.println("Ошибка БД: " + e.getMessage());
            } catch (IllegalArgumentException e) {
                System.out.println("Ошибка ввода: " + e.getMessage());
            }
        }
    }

    private void printMainMenu() {
        System.out.println();
        System.out.println("1. Фильмы");
        System.out.println("2. Пользователи");
        System.out.println("3. Жанры");
        System.out.println("4. Отзывы");
        System.out.println("5. Оценки");
        System.out.println("6. Избранное");
        System.out.println("0. Выход");
    }

    private void handleMovies() {
        runCrudMenu("Фильмы", movieDao::findAll, movieDao::findById, this::createMovie, this::updateMovie, movieDao::delete);
    }

    private void handleUsers() {
        runCrudMenu("Пользователи", userDao::findAll, userDao::findById, this::createUser, this::updateUser, userDao::delete);
    }

    private void handleGenres() {
        runCrudMenu("Жанры", genreDao::findAll, genreDao::findById, this::createGenre, this::updateGenre, genreDao::delete);
    }

    private void handleReviews() {
        runCrudMenu("Отзывы", reviewDao::findAll, reviewDao::findById, this::createReview, this::updateReview, reviewDao::delete);
    }

    private void handleRatings() {
        runCrudMenu("Оценки", ratingDao::findAll, ratingDao::findById, this::createRating, this::updateRating, ratingDao::delete);
    }

    private void handleFavorites() {
        boolean back = false;
        while (!back) {
            System.out.println();
            System.out.println("--- Избранное ---");
            System.out.println("1. Показать все");
            System.out.println("2. Добавить");
            System.out.println("3. Удалить");
            System.out.println("0. Назад");

            int choice = readInt("Выберите пункт: ");
            switch (choice) {
                case 1 -> printList(favoriteDao.findAll());
                case 2 -> createFavorite();
                case 3 -> deleteFavorite();
                case 0 -> back = true;
                default -> System.out.println("Неверный пункт меню.");
            }
        }
    }

    private <T> void runCrudMenu(
            String title,
            Supplier<List<T>> findAll,
            LongFunction<Optional<T>> findById,
            Runnable create,
            Runnable update,
            LongFunction<Boolean> delete
    ) {
        boolean back = false;
        while (!back) {
            System.out.println();
            System.out.println("--- " + title + " ---");
            System.out.println("1. Показать все");
            System.out.println("2. Найти по id");
            System.out.println("3. Создать");
            System.out.println("4. Обновить");
            System.out.println("5. Удалить");
            System.out.println("0. Назад");

            int choice = readInt("Выберите пункт: ");
            switch (choice) {
                case 1 -> printList(findAll.get());
                case 2 -> showById(findById);
                case 3 -> create.run();
                case 4 -> update.run();
                case 5 -> deleteById(delete);
                case 0 -> back = true;
                default -> System.out.println("Неверный пункт меню.");
            }
        }
    }

    private <T> void showById(LongFunction<Optional<T>> findByIdFn) {
        long id = readLong("Введите id: ");
        findByIdFn.apply(id).ifPresentOrElse(
                System.out::println,
                () -> System.out.println("Запись с id=" + id + " не найдена.")
        );
    }

    private void deleteById(LongFunction<Boolean> delete) {
        long id = readLong("Введите id для удаления: ");
        if (delete.apply(id)) {
            System.out.println("Удалено.");
        } else {
            System.out.println("Запись с id=" + id + " не найдена.");
        }
    }

    private void createMovie() {
        Movie movie = new Movie();
        movie.setTitle(readRequired("Название: "));
        movie.setOriginalTitle(readOptional("Оригинальное название: "));
        movie.setDescription(readOptional("Описание: "));
        movie.setReleaseYear(readOptionalInt("Год выпуска: "));
        movie.setDurationMinutes(readOptionalInt("Длительность (мин): "));
        movie.setPosterUrl(readOptional("URL постера: "));
        movie.setTrailerUrl(readOptional("URL трейлера: "));
        movie.setAgeRating(readOptional("Возрастной рейтинг: "));
        Movie created = movieDao.create(movie);
        System.out.println("Создан: " + created);
    }

    private void updateMovie() {
        long id = readLong("ID фильма: ");
        Optional<Movie> existing = movieDao.findById(id);
        if (existing.isEmpty()) {
            System.out.println("Фильм не найден.");
            return;
        }
        Movie movie = existing.get();
        movie.setTitle(readRequired("Название [" + movie.getTitle() + "]: ", movie.getTitle()));
        movie.setOriginalTitle(readOptional("Оригинальное название: ", movie.getOriginalTitle()));
        movie.setDescription(readOptional("Описание: ", movie.getDescription()));
        movie.setReleaseYear(readOptionalInt("Год выпуска: ", movie.getReleaseYear()));
        movie.setDurationMinutes(readOptionalInt("Длительность (мин): ", movie.getDurationMinutes()));
        movie.setPosterUrl(readOptional("URL постера: ", movie.getPosterUrl()));
        movie.setTrailerUrl(readOptional("URL трейлера: ", movie.getTrailerUrl()));
        movie.setAgeRating(readOptional("Возрастной рейтинг: ", movie.getAgeRating()));
        movieDao.update(movie);
        System.out.println("Обновлено: " + movieDao.findById(id).orElse(movie));
    }

    private void createUser() {
        User user = new User();
        user.setUsername(readRequired("Username: "));
        user.setEmail(readRequired("Email: "));
        user.setPasswordHash(readRequired("Пароль: "));
        user.setFirstName(readOptional("Имя: "));
        user.setLastName(readOptional("Фамилия: "));
        user.setActive(readBoolean("Активен (y/n): ", true));
        User created = userDao.create(user);
        System.out.println("Создан: " + created);
    }

    private void updateUser() {
        long id = readLong("ID пользователя: ");
        Optional<User> existing = userDao.findById(id);
        if (existing.isEmpty()) {
            System.out.println("Пользователь не найден.");
            return;
        }
        User user = existing.get();
        user.setUsername(readRequired("Username [" + user.getUsername() + "]: ", user.getUsername()));
        user.setEmail(readRequired("Email [" + user.getEmail() + "]: ", user.getEmail()));
        user.setPasswordHash(readRequired("Пароль: ", user.getPasswordHash()));
        user.setFirstName(readOptional("Имя: ", user.getFirstName()));
        user.setLastName(readOptional("Фамилия: ", user.getLastName()));
        user.setActive(readBoolean("Активен (y/n): ", user.isActive()));
        userDao.update(user);
        System.out.println("Обновлено: " + userDao.findById(id).orElse(user));
    }

    private void createGenre() {
        Genre genre = new Genre();
        genre.setName(readRequired("Название: "));
        genre.setSlug(readRequired("Slug: "));
        System.out.println("Создан: " + genreDao.create(genre));
    }

    private void updateGenre() {
        long id = readLong("ID жанра: ");
        Optional<Genre> existing = genreDao.findById(id);
        if (existing.isEmpty()) {
            System.out.println("Жанр не найден.");
            return;
        }
        Genre genre = existing.get();
        genre.setName(readRequired("Название [" + genre.getName() + "]: ", genre.getName()));
        genre.setSlug(readRequired("Slug [" + genre.getSlug() + "]: ", genre.getSlug()));
        genreDao.update(genre);
        System.out.println("Обновлено: " + genreDao.findById(id).orElse(genre));
    }

    private void createReview() {
        Review review = new Review();
        review.setUserId(readLong("ID пользователя: "));
        review.setMovieId(readLong("ID фильма: "));
        review.setTitle(readOptional("Заголовок: "));
        review.setBody(readRequired("Текст отзыва: "));
        System.out.println("Создан: " + reviewDao.create(review));
    }

    private void updateReview() {
        long id = readLong("ID отзыва: ");
        Optional<Review> existing = reviewDao.findById(id);
        if (existing.isEmpty()) {
            System.out.println("Отзыв не найден.");
            return;
        }
        Review review = existing.get();
        review.setUserId(readLong("ID пользователя [" + review.getUserId() + "]: ", review.getUserId()));
        review.setMovieId(readLong("ID фильма [" + review.getMovieId() + "]: ", review.getMovieId()));
        review.setTitle(readOptional("Заголовок: ", review.getTitle()));
        review.setBody(readRequired("Текст отзыва [" + review.getBody() + "]: ", review.getBody()));
        reviewDao.update(review);
        System.out.println("Обновлено: " + reviewDao.findById(id).orElse(review));
    }

    private void createRating() {
        Rating rating = new Rating();
        rating.setUserId(readLong("ID пользователя: "));
        rating.setMovieId(readLong("ID фильма: "));
        rating.setScore(readInt("Оценка (1-5): ", 1, 5));
        System.out.println("Создана: " + ratingDao.create(rating));
    }

    private void updateRating() {
        long id = readLong("ID оценки: ");
        Optional<Rating> existing = ratingDao.findById(id);
        if (existing.isEmpty()) {
            System.out.println("Оценка не найдена.");
            return;
        }
        Rating rating = existing.get();
        rating.setUserId(readLong("ID пользователя [" + rating.getUserId() + "]: ", rating.getUserId()));
        rating.setMovieId(readLong("ID фильма [" + rating.getMovieId() + "]: ", rating.getMovieId()));
        rating.setScore(readInt("Оценка (1-5): ", 1, 5, rating.getScore()));
        ratingDao.update(rating);
        System.out.println("Обновлено: " + ratingDao.findById(id).orElse(rating));
    }

    private void createFavorite() {
        Favorite favorite = new Favorite();
        favorite.setUserId(readLong("ID пользователя: "));
        favorite.setMovieId(readLong("ID фильма: "));
        favoriteDao.create(favorite);
        System.out.println("Добавлено в избранное.");
    }

    private void deleteFavorite() {
        long userId = readLong("ID пользователя: ");
        long movieId = readLong("ID фильма: ");
        if (favoriteDao.delete(userId, movieId)) {
            System.out.println("Удалено из избранного.");
        } else {
            System.out.println("Запись не найдена.");
        }
    }

    private <T> void printList(List<T> items) {
        if (items.isEmpty()) {
            System.out.println("Список пуст.");
            return;
        }
        items.forEach(System.out::println);
    }

    private String readRequired(String prompt) {
        while (true) {
            System.out.print(prompt);
            String value = scanner.nextLine().trim();
            if (!value.isEmpty()) {
                return value;
            }
            System.out.println("Поле обязательно.");
        }
    }

    private String readRequired(String prompt, String defaultValue) {
        System.out.print(prompt);
        String value = scanner.nextLine().trim();
        return value.isEmpty() ? defaultValue : value;
    }

    private String readOptional(String prompt) {
        System.out.print(prompt);
        String value = scanner.nextLine().trim();
        return value.isEmpty() ? null : value;
    }

    private String readOptional(String prompt, String defaultValue) {
        System.out.print(prompt);
        String value = scanner.nextLine().trim();
        return value.isEmpty() ? defaultValue : value;
    }

    private Integer readOptionalInt(String prompt) {
        System.out.print(prompt);
        String value = scanner.nextLine().trim();
        if (value.isEmpty()) {
            return null;
        }
        return Integer.parseInt(value);
    }

    private Integer readOptionalInt(String prompt, Integer defaultValue) {
        System.out.print(prompt);
        String value = scanner.nextLine().trim();
        if (value.isEmpty()) {
            return defaultValue;
        }
        return Integer.parseInt(value);
    }

    private int readInt(String prompt) {
        while (true) {
            System.out.print(prompt);
            String value = scanner.nextLine().trim();
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException e) {
                System.out.println("Введите целое число.");
            }
        }
    }

    private int readInt(String prompt, int min, int max) {
        while (true) {
            int value = readInt(prompt);
            if (value >= min && value <= max) {
                return value;
            }
            System.out.println("Значение должно быть от " + min + " до " + max + ".");
        }
    }

    private int readInt(String prompt, int min, int max, int defaultValue) {
        System.out.print(prompt);
        String value = scanner.nextLine().trim();
        if (value.isEmpty()) {
            return defaultValue;
        }
        int parsed = Integer.parseInt(value);
        if (parsed < min || parsed > max) {
            throw new IllegalArgumentException("Значение должно быть от " + min + " до " + max + ".");
        }
        return parsed;
    }

    private long readLong(String prompt) {
        while (true) {
            System.out.print(prompt);
            String value = scanner.nextLine().trim();
            try {
                return Long.parseLong(value);
            } catch (NumberFormatException e) {
                System.out.println("Введите целое число.");
            }
        }
    }

    private long readLong(String prompt, long defaultValue) {
        System.out.print(prompt);
        String value = scanner.nextLine().trim();
        if (value.isEmpty()) {
            return defaultValue;
        }
        return Long.parseLong(value);
    }

    private boolean readBoolean(String prompt, boolean defaultValue) {
        System.out.print(prompt);
        String value = scanner.nextLine().trim().toLowerCase();
        if (value.isEmpty()) {
            return defaultValue;
        }
        return value.startsWith("y") || value.equals("1") || value.equals("true") || value.equals("да");
    }
}
