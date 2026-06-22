# Схема базы данных Cinema

PostgreSQL · SQL: [`schema.sql`](schema.sql)

## ER-диаграмма

```
┌─────────────┐       ┌───────────────┐       ┌─────────────┐
│   genres    │ M:N   │ movie_genres  │ M:N   │   movies    │
├─────────────┤◄─────►├───────────────┤◄─────►├─────────────┤
│ id PK       │       │ movie_id PK,FK│       │ id PK       │
│ name UK     │       │ genre_id PK,FK│       │ title       │
│ slug UK     │       └───────────────┘       │ description │
└─────────────┘                               └──────┬──────┘
┌─────────────┐       ┌─────────────────┐            │
│  countries  │ M:N   │ movie_countries │ M:N        │
├─────────────┤◄─────►├─────────────────┤◄───────────┤
│ id PK       │       │ movie_id PK,FK  │            │
│ name UK     │       │ country_id PK,FK│            │
│ iso_code UK │       └─────────────────┘            │
└─────────────┘                                      │
                                                     │
┌─────────────┐       ┌───────────────┐              │
│   actors    │ M:N   │ movie_actors  │ M:N          │
├─────────────┤◄─────►├───────────────┤◄─────────────┤
│ id PK       │       │ movie_id PK,FK│              │
│ full_name   │       │ actor_id PK,FK│              │
│ birth_date  │       │ role_name     │              │
└─────────────┘       └───────────────┘              │
                                                     │
┌─────────────┐       ┌─────────────────┐            │
│  directors  │ M:N   │ movie_directors │ M:N        │
├─────────────┤◄─────►├─────────────────┤◄───────────┤
│ id PK       │       │ movie_id PK,FK  │            │
│ full_name   │       │ director_id PK,FK│           │
└─────────────┘       └─────────────────┘            │
                                                     │
┌─────────────┐       ┌───────────────┐              │
│    tags     │ M:N   │  movie_tags   │ M:N          │
├─────────────┤◄─────►├───────────────┤◄─────────────┘
│ id PK       │       │ movie_id PK,FK│
│ name UK     │       │ tag_id PK,FK  │
└─────────────┘       └───────────────┘


┌─────────────┐       ┌───────────────┐       ┌─────────────┐
│    users    │ M:N   │  user_roles   │ M:N   │    roles    │
├─────────────┤◄─────►├───────────────┤◄─────►├─────────────┤
│ id PK       │       │ user_id PK,FK │       │ id PK       │
│ username UK │       │ role_id PK,FK │       │ name UK     │
│ email UK    │       └───────────────┘       └─────────────┘
│ password_hash│
│ is_active   │
└──────┬──────┘
       │ 1:N
       ├──────────────────────────────┐
       │ M:N                          │ M:N
       ▼                              ▼
┌───────────────┐              ┌─────────────┐
│   favorites   │              │   ratings   │
├───────────────┤              ├─────────────┤
│ user_id PK,FK │              │ id PK       │
│ movie_id PK,FK│◄──── M:N ───►│ user_id FK  │
│ added_at      │    movies    │ movie_id FK │
└───────────────┘              │ score 1-5   │
                               └─────────────┘
       │ 1:N
       ▼
┌─────────────┐
│   reviews   │
├─────────────┤
│ id PK       │
│ user_id FK  │◄──── 1:N ──── movies
│ movie_id FK │
│ title       │
│ body        │
└─────────────┘
```

**Обозначения:** PK — первичный ключ · FK — внешний ключ · UK — уникальное поле · **M:N** — многие ко многим · **1:N** — один ко многим

---

## Связи

| От | К | Тип | Таблица-связка |
|----|---|-----|----------------|
| movies | genres | **M:N** | movie_genres |
| movies | countries | **M:N** | movie_countries |
| movies | actors | **M:N** | movie_actors |
| movies | directors | **M:N** | movie_directors |
| movies | tags | **M:N** | movie_tags |
| users | roles | **M:N** | user_roles |
| users | movies | **M:N** | favorites |
| users | ratings | **1:N** | — |
| movies | ratings | **1:N** | — |
| users | reviews | **1:N** | — |
| movies | reviews | **1:N** | — |

---

## Таблицы

### genres
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| slug | VARCHAR(100) | NOT NULL, UNIQUE |

### countries
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| iso_code | CHAR(2) | NOT NULL, UNIQUE |

### actors
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | BIGSERIAL | PK |
| full_name | VARCHAR(200) | NOT NULL |
| birth_date | DATE | |
| bio | TEXT | |
| photo_url | VARCHAR(500) | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### directors
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | BIGSERIAL | PK |
| full_name | VARCHAR(200) | NOT NULL |
| birth_date | DATE | |
| bio | TEXT | |
| photo_url | VARCHAR(500) | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### tags
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(50) | NOT NULL, UNIQUE |

### roles
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(50) | NOT NULL, UNIQUE |

### users
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | BIGSERIAL | PK |
| username | VARCHAR(50) | NOT NULL, UNIQUE |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### movies
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | BIGSERIAL | PK |
| title | VARCHAR(255) | NOT NULL |
| original_title | VARCHAR(255) | |
| description | TEXT | |
| release_year | SMALLINT | CHECK 1888–2100 |
| duration_minutes | SMALLINT | CHECK > 0 |
| poster_url | VARCHAR(500) | |
| trailer_url | VARCHAR(500) | |
| age_rating | VARCHAR(10) | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### movie_genres *(M:N)*
| Поле | Тип | Ограничения |
|------|-----|-------------|
| movie_id | BIGINT | PK, FK → movies |
| genre_id | BIGINT | PK, FK → genres |

### movie_countries *(M:N)*
| Поле | Тип | Ограничения |
|------|-----|-------------|
| movie_id | BIGINT | PK, FK → movies |
| country_id | BIGINT | PK, FK → countries |

### movie_actors *(M:N)*
| Поле | Тип | Ограничения |
|------|-----|-------------|
| movie_id | BIGINT | PK, FK → movies |
| actor_id | BIGINT | PK, FK → actors |
| role_name | VARCHAR(200) | |

### movie_directors *(M:N)*
| Поле | Тип | Ограничения |
|------|-----|-------------|
| movie_id | BIGINT | PK, FK → movies |
| director_id | BIGINT | PK, FK → directors |

### movie_tags *(M:N)*
| Поле | Тип | Ограничения |
|------|-----|-------------|
| movie_id | BIGINT | PK, FK → movies |
| tag_id | BIGINT | PK, FK → tags |

### user_roles *(M:N)*
| Поле | Тип | Ограничения |
|------|-----|-------------|
| user_id | BIGINT | PK, FK → users |
| role_id | BIGINT | PK, FK → roles |

### favorites *(M:N)*
| Поле | Тип | Ограничения |
|------|-----|-------------|
| user_id | BIGINT | PK, FK → users |
| movie_id | BIGINT | PK, FK → movies |
| added_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### ratings *(1:N)*
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | BIGSERIAL | PK |
| user_id | BIGINT | FK → users, UNIQUE(user_id, movie_id) |
| movie_id | BIGINT | FK → movies |
| score | SMALLINT | NOT NULL, CHECK 1–5 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### reviews *(1:N)*
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | BIGSERIAL | PK |
| user_id | BIGINT | FK → users, UNIQUE(user_id, movie_id) |
| movie_id | BIGINT | FK → movies |
| title | VARCHAR(200) | |
| body | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
