-- =============================================================================
-- Online Cinema — PostgreSQL schema
-- =============================================================================
-- Возможности: регистрация, отзывы, оценки (1–5 звёзд), избранное
--
-- Таблицы (17):
--   genres, countries, actors, directors, tags, roles,
--   users, movies,
--   movie_genres, movie_countries, movie_actors, movie_directors, movie_tags,
--   user_roles, favorites, ratings, reviews
--
-- Связи многие-ко-многим:
--   movies ↔ genres, countries, actors, directors, tags
--   users  ↔ movies (favorites), roles
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Cleanup (для повторного применения скрипта)
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_users_updated_at    ON users;
DROP TRIGGER IF EXISTS trg_movies_updated_at   ON movies;
DROP TRIGGER IF EXISTS trg_ratings_updated_at  ON ratings;
DROP TRIGGER IF EXISTS trg_reviews_updated_at  ON reviews;

DROP FUNCTION IF EXISTS set_updated_at();

DROP TABLE IF EXISTS reviews          CASCADE;
DROP TABLE IF EXISTS ratings          CASCADE;
DROP TABLE IF EXISTS favorites        CASCADE;
DROP TABLE IF EXISTS user_roles       CASCADE;
DROP TABLE IF EXISTS movie_tags       CASCADE;
DROP TABLE IF EXISTS movie_directors  CASCADE;
DROP TABLE IF EXISTS movie_actors     CASCADE;
DROP TABLE IF EXISTS movie_countries  CASCADE;
DROP TABLE IF EXISTS movie_genres     CASCADE;
DROP TABLE IF EXISTS movies           CASCADE;
DROP TABLE IF EXISTS users            CASCADE;
DROP TABLE IF EXISTS roles            CASCADE;
DROP TABLE IF EXISTS tags             CASCADE;
DROP TABLE IF EXISTS directors        CASCADE;
DROP TABLE IF EXISTS actors           CASCADE;
DROP TABLE IF EXISTS countries        CASCADE;
DROP TABLE IF EXISTS genres           CASCADE;

-- ---------------------------------------------------------------------------
-- Справочники
-- ---------------------------------------------------------------------------

CREATE TABLE genres (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE countries (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    iso_code    CHAR(2)      NOT NULL UNIQUE
);

CREATE TABLE actors (
    id          BIGSERIAL PRIMARY KEY,
    full_name   VARCHAR(200) NOT NULL,
    birth_date  DATE,
    bio         TEXT,
    photo_url   VARCHAR(500),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE directors (
    id          BIGSERIAL PRIMARY KEY,
    full_name   VARCHAR(200) NOT NULL,
    birth_date  DATE,
    bio         TEXT,
    photo_url   VARCHAR(500),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------------
-- Пользователи (регистрация)
-- ---------------------------------------------------------------------------

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Фильмы
-- ---------------------------------------------------------------------------

CREATE TABLE movies (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    original_title      VARCHAR(255),
    description         TEXT,
    release_year        SMALLINT,
    duration_minutes    SMALLINT,
    poster_url          VARCHAR(500),
    trailer_url         VARCHAR(500),
    age_rating          VARCHAR(10),
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT movies_release_year_chk
        CHECK (release_year IS NULL OR release_year BETWEEN 1888 AND 2100),
    CONSTRAINT movies_duration_chk
        CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- ---------------------------------------------------------------------------
-- Связи многие-ко-многим
-- ---------------------------------------------------------------------------

CREATE TABLE movie_genres (
    movie_id    BIGINT NOT NULL REFERENCES movies(id)  ON DELETE CASCADE,
    genre_id    BIGINT NOT NULL REFERENCES genres(id)  ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE movie_countries (
    movie_id    BIGINT NOT NULL REFERENCES movies(id)    ON DELETE CASCADE,
    country_id  BIGINT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, country_id)
);

CREATE TABLE movie_actors (
    movie_id    BIGINT       NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    actor_id    BIGINT       NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    role_name   VARCHAR(200),
    PRIMARY KEY (movie_id, actor_id)
);

CREATE TABLE movie_directors (
    movie_id    BIGINT NOT NULL REFERENCES movies(id)     ON DELETE CASCADE,
    director_id BIGINT NOT NULL REFERENCES directors(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, director_id)
);

CREATE TABLE movie_tags (
    movie_id    BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    tag_id      BIGINT NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
    PRIMARY KEY (movie_id, tag_id)
);

CREATE TABLE user_roles (
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Избранное: пользователь ↔ фильм
CREATE TABLE favorites (
    user_id     BIGINT      NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    movie_id    BIGINT      NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, movie_id)
);

-- ---------------------------------------------------------------------------
-- Оценки (звёзды 1–5)
-- ---------------------------------------------------------------------------

CREATE TABLE ratings (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    movie_id    BIGINT      NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    score       SMALLINT    NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ratings_user_movie_uniq UNIQUE (user_id, movie_id),
    CONSTRAINT ratings_score_chk CHECK (score BETWEEN 1 AND 5)
);

-- ---------------------------------------------------------------------------
-- Текстовые отзывы
-- ---------------------------------------------------------------------------

CREATE TABLE reviews (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    movie_id    BIGINT      NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    title       VARCHAR(200),
    body        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT reviews_user_movie_uniq UNIQUE (user_id, movie_id),
    CONSTRAINT reviews_body_not_empty CHECK (LENGTH(TRIM(body)) > 0)
);

-- ---------------------------------------------------------------------------
-- Индексы
-- ---------------------------------------------------------------------------

CREATE INDEX idx_users_email           ON users (email);
CREATE INDEX idx_users_username        ON users (username);

CREATE INDEX idx_movies_title          ON movies (title);
CREATE INDEX idx_movies_release_year   ON movies (release_year);

CREATE INDEX idx_ratings_movie_id      ON ratings (movie_id);
CREATE INDEX idx_ratings_user_id       ON ratings (user_id);

CREATE INDEX idx_reviews_movie_id      ON reviews (movie_id);
CREATE INDEX idx_reviews_user_id       ON reviews (user_id);
CREATE INDEX idx_reviews_created_at    ON reviews (created_at DESC);

CREATE INDEX idx_favorites_user_id     ON favorites (user_id);
CREATE INDEX idx_favorites_movie_id    ON favorites (movie_id);

CREATE INDEX idx_movie_genres_genre_id ON movie_genres (genre_id);
CREATE INDEX idx_movie_actors_actor_id ON movie_actors (actor_id);
CREATE INDEX idx_movie_tags_tag_id     ON movie_tags (tag_id);

-- ---------------------------------------------------------------------------
-- Триггер: автообновление updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_movies_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Начальные данные (для локальной разработки)
-- ---------------------------------------------------------------------------

INSERT INTO roles (name) VALUES
    ('USER'),
    ('ADMIN');

INSERT INTO genres (name, slug) VALUES
    ('Драма',          'drama'),
    ('Комедия',        'comedy'),
    ('Боевик',         'action'),
    ('Фантастика',     'sci-fi'),
    ('Триллер',        'thriller'),
    ('Ужасы',          'horror'),
    ('Мелодрама',      'romance'),
    ('Документальный', 'documentary');

INSERT INTO countries (name, iso_code) VALUES
    ('Россия',         'RU'),
    ('США',            'US'),
    ('Великобритания', 'GB'),
    ('Франция',        'FR'),
    ('Япония',         'JP');

INSERT INTO tags (name) VALUES
    ('Оскар'),
    ('Классика'),
    ('Новинка'),
    ('Семейный'),
    ('По книге');

COMMIT;
