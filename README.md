# Cinema

Онлайн-кинотеатр: каталог фильмов, регистрация пользователей, оценки, отзывы и избранное.

## Стек

- Java 17, Spring Boot 3, Maven
- React 19 + Vite + TypeScript
- PostgreSQL в Docker

## Запуск (только Docker, как в CRM)

1. Создай файл секретов (один раз):
   ```bash
   copy .env.example .env
   ```
2. Задай в `.env` пароль БД и `JWT_SECRET` (минимум 32 символа).
3. Подними проект:
   ```bash
   docker compose --profile production up -d --build
   ```
4. **Сайт:** http://localhost:5173
5. **Swagger:** http://localhost:8080/swagger-ui.html

PostgreSQL работает **только в контейнере** `cinema-postgres`. Локально PostgreSQL ставить не нужно.

### Запуск из IntelliJ

1. Убедись, что Docker Desktop запущен.
2. Файл `.env` в корне проекта должен существовать (см. шаг 1).
3. Запусти `CinemaApplication` — Spring Boot сам поднимет контейнер `db` и подключится к нему.

При запуске из IDE поднимается только БД, не контейнер `app` (чтобы не было конфликта порта 8080).

### Фронтенд (разработка)

1. Запусти бэкенд из IntelliJ (`CinemaApplication`) или Docker `app`.
2. В каталоге `frontend`:
   ```bash
   npm install
   npm run dev
   ```
3. Открой http://localhost:5173 — запросы к API проксируются на `:8080`.

Если порт `5432` занят (например, CRM или служба PostgreSQL в Windows) — cinema использует **5433** (см. `POSTGRES_HOST_PORT` в `.env`). Измени порт при необходимости в `docker-compose.yml`.

## Секреты — что нельзя пушить в Git

| Файл / данные | Почему |
|---------------|--------|
| `.env` | Пароль PostgreSQL, JWT-секрет |
| `.env.local`, `.env.*.local` | Локальные переопределения секретов |
| `*.pem`, `*.key`, `*.p12`, `*.jks` | Ключи и сертификаты |
| `credentials.json`, `secrets.json` | Файлы с учётными данными |
| `.idea/` | Настройки IDE |
| `target/`, `*.log` | Сборка и логи |
| `docker-compose.override.yml` | Локальные переопределения Docker |

В репозитории хранится только `.env.example` с placeholder-значениями.

Секреты для CI (SonarCloud) — через GitHub Actions Secrets: `SONAR_TOKEN`.

## SonarCloud

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kirirut_cinema&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kirirut_cinema)

[Открыть проект в SonarCloud](https://sonarcloud.io/project/overview?id=kirirut_cinema)

## План-факт

| Задача | План (ч) | Факт (ч) |
|--------|----------|----------|
| Проектирование и создание схемы БД, настройка SonarCloud | 8 | 6 |
