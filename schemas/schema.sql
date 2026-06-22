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
    avg_rating          NUMERIC(3, 2) NOT NULL DEFAULT 0,
    ratings_count       INTEGER        NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT movies_release_year_chk
        CHECK (release_year IS NULL OR release_year BETWEEN 1888 AND 2100),
    CONSTRAINT movies_duration_chk
        CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    CONSTRAINT movies_avg_rating_chk
        CHECK (avg_rating >= 0 AND avg_rating <= 5)
);

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

CREATE TABLE favorites (
    user_id     BIGINT      NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    movie_id    BIGINT      NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, movie_id)
);

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

CREATE INDEX idx_users_email           ON users (email);
CREATE INDEX idx_users_username        ON users (username);

CREATE INDEX idx_movies_title          ON movies (title);
CREATE INDEX idx_movies_release_year   ON movies (release_year);
CREATE INDEX idx_movies_avg_rating     ON movies (avg_rating DESC);

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

CREATE OR REPLACE FUNCTION refresh_movie_avg_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    target_movie_id BIGINT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_movie_id := OLD.movie_id;
    ELSE
        target_movie_id := NEW.movie_id;
    END IF;

    UPDATE movies m
    SET avg_rating    = COALESCE(sub.avg, 0),
        ratings_count = COALESCE(sub.cnt, 0),
        updated_at    = NOW()
    FROM (
        SELECT movie_id,
               ROUND(AVG(score)::NUMERIC, 2) AS avg,
               COUNT(*)::INTEGER             AS cnt
        FROM ratings
        WHERE movie_id = target_movie_id
        GROUP BY movie_id
    ) sub
    WHERE m.id = target_movie_id;

    IF NOT FOUND AND TG_OP = 'DELETE' THEN
        UPDATE movies
        SET avg_rating = 0, ratings_count = 0, updated_at = NOW()
        WHERE id = target_movie_id;
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_ratings_refresh_avg
    AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH ROW EXECUTE FUNCTION refresh_movie_avg_rating();

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
