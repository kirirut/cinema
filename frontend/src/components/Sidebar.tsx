import { NavLink } from 'react-router-dom';
import type { Catalog } from '../api';

interface SidebarProps {
  catalog: Catalog | null;
  activeGenreId?: number;
  activeCountryId?: number;
  activeTagId?: number;
}

export function Sidebar({ catalog, activeGenreId, activeCountryId, activeTagId }: SidebarProps) {
  const hasFilter = activeGenreId || activeCountryId || activeTagId;

  return (
    <aside className="sidebar">
      <section className="sidebar__block">
        <h3 className="sidebar__title">Жанры</h3>
        <ul className="sidebar__list">
          <li>
            <NavLink
              to="/"
              end
              className={() =>
                `sidebar__link${!hasFilter ? ' sidebar__link--active' : ''}`
              }
            >
              Все фильмы
            </NavLink>
          </li>
          {catalog?.genres.map((genre) => (
            <li key={genre.id}>
              <NavLink
                to={`/?genreId=${genre.id}`}
                className={() =>
                  `sidebar__link${activeGenreId === genre.id ? ' sidebar__link--active' : ''}`
                }
              >
                {genre.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </section>

      {catalog && catalog.countries.length > 0 && (
        <section className="sidebar__block">
          <h3 className="sidebar__title">Страны</h3>
          <ul className="sidebar__list sidebar__list--compact">
            {catalog.countries.map((country) => (
              <li key={country.id}>
                <NavLink
                  to={`/?countryId=${country.id}`}
                  className={() =>
                    `sidebar__link${activeCountryId === country.id ? ' sidebar__link--active' : ''}`
                  }
                >
                  {country.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {catalog && catalog.tags.length > 0 && (
        <section className="sidebar__block">
          <h3 className="sidebar__title">Подборки</h3>
          <ul className="sidebar__list sidebar__list--tags">
            {catalog.tags.map((tag) => (
              <li key={tag.id}>
                <NavLink
                  to={`/?tagId=${tag.id}`}
                  className={() =>
                    `sidebar__link sidebar__link--tag${activeTagId === tag.id ? ' sidebar__link--active' : ''}`
                  }
                >
                  {tag.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
