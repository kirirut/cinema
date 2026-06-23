import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fakerRU as faker } from '@faker-js/faker';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const MOVIE_COUNT = Number(process.env.SEED_MOVIES ?? 40);
const DIRECTOR_COUNT = Number(process.env.SEED_DIRECTORS ?? 15);
const ACTOR_COUNT = Number(process.env.SEED_ACTORS ?? 30);

const AGE_RATINGS = ['0+', '6+', '12+', '16+', '18+'];

function loadEnv() {
  const envPath = resolve(ROOT, '.env');
  const env = { ...process.env };
  if (!existsSync(envPath)) return env;

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in env)) env[key] = value;
  }
  return env;
}

function pickMany(items, min, max) {
  const count = faker.number.int({ min, max: Math.min(max, items.length) });
  return faker.helpers.arrayElements(items, count);
}

function movieTitle() {
  const templates = [
    () => faker.lorem.words({ min: 2, max: 4 }).replace(/^\w/, (c) => c.toUpperCase()),
    () => `${faker.location.city()} ${faker.number.int({ min: 1, max: 3 })}`,
    () => faker.commerce.productName(),
    () => faker.word.words({ count: { min: 2, max: 3 } }).replace(/^\w/, (c) => c.toUpperCase()),
  ];
  return faker.helpers.arrayElement(templates)();
}

async function main() {
  const env = loadEnv();
  faker.seed(Number(process.env.SEED ?? 42));

  const client = new pg.Client({
    host: env.POSTGRES_HOST ?? 'localhost',
    port: Number(env.POSTGRES_HOST_PORT ?? 5433),
    user: env.POSTGRES_USER ?? 'postgres',
    password: env.POSTGRES_PASSWORD ?? 'change-me',
    database: env.POSTGRES_DB ?? 'cinema',
  });

  await client.connect();

  try {
    const { rows: existing } = await client.query('SELECT COUNT(*)::int AS count FROM movies');
    if (existing[0].count > 0 && env.SEED_FORCE !== '1') {
      console.log(`В БД уже ${existing[0].count} фильм(ов) — seed пропущен. SEED_FORCE=1 для повторного заполнения.`);
      return;
    }

    const { rows: genres } = await client.query('SELECT id FROM genres ORDER BY id');
    const { rows: countries } = await client.query('SELECT id FROM countries ORDER BY id');
    const { rows: tags } = await client.query('SELECT id FROM tags ORDER BY id');

    if (!genres.length || !countries.length) {
      throw new Error('Справочник жанров/стран пуст — проверьте схему БД');
    }

    console.log(`Создаю ${DIRECTOR_COUNT} режиссёров…`);
    const directorIds = [];
    for (let i = 0; i < DIRECTOR_COUNT; i += 1) {
      const { rows } = await client.query(
        `INSERT INTO directors (full_name, birth_date, bio, photo_url)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          faker.person.fullName(),
          faker.date.birthdate({ min: 1940, max: 1995, mode: 'year' }),
          faker.lorem.paragraph(),
          `https://i.pravatar.cc/150?u=${faker.string.uuid()}`,
        ],
      );
      directorIds.push(rows[0].id);
    }

    console.log(`Создаю ${ACTOR_COUNT} актёров…`);
    const actorIds = [];
    for (let i = 0; i < ACTOR_COUNT; i += 1) {
      const { rows } = await client.query(
        `INSERT INTO actors (full_name, birth_date, bio, photo_url)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          faker.person.fullName(),
          faker.date.birthdate({ min: 1950, max: 2005, mode: 'year' }),
          faker.lorem.sentences({ min: 1, max: 2 }),
          `https://i.pravatar.cc/150?u=${faker.string.uuid()}`,
        ],
      );
      actorIds.push(rows[0].id);
    }

    console.log(`Создаю ${MOVIE_COUNT} фильмов…`);
    for (let i = 0; i < MOVIE_COUNT; i += 1) {
      const title = movieTitle();
      const seed = faker.string.uuid();

      const { rows } = await client.query(
        `INSERT INTO movies (title, original_title, description, release_year, duration_minutes, poster_url, trailer_url, age_rating)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          title,
          faker.helpers.maybe(() => faker.lorem.words(3), { probability: 0.6 }) ?? null,
          faker.lorem.paragraphs({ min: 1, max: 2 }),
          faker.number.int({ min: 1980, max: 2025 }),
          faker.number.int({ min: 75, max: 180 }),
          `https://picsum.photos/seed/${seed}/180/260`,
          faker.helpers.maybe(() => `https://www.youtube.com/watch?v=${faker.string.alphanumeric(11)}`) ?? null,
          faker.helpers.arrayElement(AGE_RATINGS),
        ],
      );
      const movieId = rows[0].id;

      for (const genreId of pickMany(genres.map((g) => g.id), 1, 3)) {
        await client.query(
          'INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [movieId, genreId],
        );
      }

      for (const countryId of pickMany(countries.map((c) => c.id), 1, 2)) {
        await client.query(
          'INSERT INTO movie_countries (movie_id, country_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [movieId, countryId],
        );
      }

      for (const directorId of pickMany(directorIds, 1, 2)) {
        await client.query(
          'INSERT INTO movie_directors (movie_id, director_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [movieId, directorId],
        );
      }

      for (const tagId of pickMany(tags.map((t) => t.id), 0, 2)) {
        await client.query(
          'INSERT INTO movie_tags (movie_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [movieId, tagId],
        );
      }

      for (const actorId of pickMany(actorIds, 2, 5)) {
        await client.query(
          'INSERT INTO movie_actors (movie_id, actor_id, role_name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [movieId, actorId, faker.person.jobTitle()],
        );
      }

      if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${MOVIE_COUNT}`);
    }

    console.log('Готово.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
