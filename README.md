# Cinema

Онлайн-кинотеатр: каталог фильмов, регистрация пользователей, оценки, отзывы и избранное.

## Стек

- Java 17, Maven
- PostgreSQL
- **React** — `frontend/` (ветка `react`)
- **Angular 19** — `angular-app/` (ветка `angular`)

### Angular-фронтенд

```bash
cd angular-app
npm install
npm start
```

→ http://localhost:4200 (прокси API на `:8080`)

### Тестовые данные (faker)

При запущенном PostgreSQL (контейнер `cinema-postgres` или локально) и файле `.env` в корне проекта:

```bash
cd scripts
npm install
npm run seed
```

Скрипт добавляет режиссёров, актёров и ~40 фильмов со случайными данными. Параметры: `SEED_MOVIES`, `SEED_DIRECTORS`, `SEED_ACTORS`, `POSTGRES_HOST_PORT`.

## SonarCloud

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kirirut_cinema&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kirirut_cinema)

[Открыть проект в SonarCloud](https://sonarcloud.io/project/overview?id=kirirut_cinema)

## План-факт

| Задача | План (ч) | Факт (ч) |
|--------|----------|----------|
| Проектирование и создание схемы БД, настройка SonarCloud | 8 | 6 |
