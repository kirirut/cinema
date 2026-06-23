# CINEMA+ — Angular Frontend

Стриминговый UI в духе Kinopoisk / IVI: hero-баннер, горизонтальные карусели по жанрам, карточки с hover-эффектом, градиентная тёмная тема.

## Запуск

1. Убедитесь, что бэкенд Spring Boot работает на **http://localhost:8080**
2. В каталоге `angular-app`:

```bash
npm install
npm start
```

3. Откройте **http://localhost:4200**

API проксируется на `:8080` через `proxy.conf.json`.

### Тестовые данные

Из корня репозитория (нужен PostgreSQL и `.env`):

```bash
cd scripts
npm install
npm run seed
```

Добавляет ~40 фильмов, актёров и режиссёров через [faker](https://fakerjs.dev/).

## Страницы

| Путь | Описание |
|------|----------|
| `/` | Главная — hero + карусели по жанрам |
| `/browse` | Каталог с фильтрами и сеткой |
| `/movie/:id` | Страница фильма |
| `/my-list` | Избранное (auth) |
| `/for-you` | Рекомендации (auth) |
| `/profile` | Профиль (auth) |
| `/login`, `/register` | Авторизация |

## Сборка

```bash
npm run build
```

Артефакты: `dist/angular-app/`
