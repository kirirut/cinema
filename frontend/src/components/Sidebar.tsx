import { NavLink } from 'react-router-dom';
import type { Catalog } from '../api';

interface SidebarProps {
  catalog: Catalog | null;
  activeGenreId?: number;
  activeCountryId?: number;
}

export function Sidebar({ catalog, activeGenreId, activeCountryId }: SidebarProps) {
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
                `sidebar__link${!activeGenreId && !activeCountryId ? ' sidebar__link--active' : ''}`
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
    </aside>
  );
}
