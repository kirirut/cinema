# Cinema

Онлайн-кинотеатр: каталог фильмов, регистрация пользователей, оценки, отзывы и избранное.

## Стек

- Java 17, Spring Boot 3, Maven
- PostgreSQL
- **Angular 19** — `angular-app/` (ветка `angular`)
- **React** — `frontend/` (ветка `react`)

## Запуск одной командой (Docker)

1. Создай файл секретов (один раз):

```bash
copy .env.example .env
```

Задай в `.env` пароль БД и `JWT_SECRET` (минимум 32 символа).

2. Подними весь проект:

```bash
docker compose up -d --build
```

Docker поднимет:
- **PostgreSQL** — порт `5433` (или `POSTGRES_HOST_PORT`)
- **seed** — заполнит БД фильмами, актёрами и режиссёрами (faker)
- **Spring Boot API** — http://localhost:8080
- **Angular** — http://localhost:4200

3. Swagger: http://localhost:8080/swagger-ui.html

Повторный seed при уже заполненной БД пропускается. Чтобы добавить данные снова:

```bash
docker compose run --rm -e SEED_FORCE=1 seed
```

Остановить:

```bash
docker compose down
```

Полный сброс БД:

```bash
docker compose down -v
docker compose up -d --build
```

## Angular-фронтенд (разработка)

```bash
cd angular-app
npm install
npm start
```

→ http://localhost:4200 (прокси API на `:8080`)

## SonarCloud

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kirirut_cinema&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kirirut_cinema)

[Открыть проект в SonarCloud](https://sonarcloud.io/project/overview?id=kirirut_cinema)

## План-факт

| Задача | План (ч) | Факт (ч) |
|--------|----------|----------|
| Проектирование и создание схемы БД, настройка SonarCloud | 8 | 6 |
