import { Outlet, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { catalogApi, type Catalog } from '../api';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useScrollTop } from '../hooks/useScrollTop';

export interface LayoutContext {
  catalog: Catalog | null;
}

export function Layout() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [searchParams] = useSearchParams();
  const genreId = searchParams.get('genreId');
  const countryId = searchParams.get('countryId');
  const tagId = searchParams.get('tagId');

  useScrollTop();

  useEffect(() => {
    catalogApi.get().then(setCatalog).catch(console.error);
  }, []);

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar
          catalog={catalog}
          activeGenreId={genreId ? Number(genreId) : undefined}
          activeCountryId={countryId ? Number(countryId) : undefined}
          activeTagId={tagId ? Number(tagId) : undefined}
        />
        <main className="main-content" id="main-content">
          <Outlet context={{ catalog } satisfies LayoutContext} />
        </main>
      </div>
      <footer className="footer">
        <div className="footer__inner">
          <p className="footer__brand">Cinema</p>
          <p className="footer__text">Онлайн-каталог фильмов — оценки, отзывы, избранное</p>
        </div>
      </footer>
    </div>
  );
}
