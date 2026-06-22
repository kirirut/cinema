# Cinema

Онлайн-кинотеатр: каталог фильмов, регистрация пользователей, оценки, отзывы и избранное.

## Стек

- Java 17, Maven
- PostgreSQL

## SonarCloud

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kirirut_cinema&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kirirut_cinema)

[Открыть проект в SonarCloud](https://sonarcloud.io/project/overview?id=kirirut_cinema)

## База данных

Схема: `schemas/schema.sql`

```bash
psql -U postgres -c "CREATE DATABASE cinema ENCODING 'UTF8';"
psql -U postgres -d cinema -f schemas/schema.sql
```

## Анализ SonarCloud

Локально (токен — через переменную окружения, не хранить в репозитории):

```bash
set SONAR_TOKEN=your_token_here
mvn clean verify sonar:sonar
```

В CI токен задаётся в GitHub: **Settings → Secrets and variables → Actions → SONAR_TOKEN**.
