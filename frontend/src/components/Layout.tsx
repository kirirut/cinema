import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { catalogApi, type Catalog } from '../api';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useSearchParams } from 'react-router-dom';

export function Layout() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [searchParams] = useSearchParams();
  const genreId = searchParams.get('genreId');
  const countryId = searchParams.get('countryId');

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
        />
        <main className="main-content">
          <Outlet context={{ catalog }} />
        </main>
      </div>
      <footer className="footer">
        <p>Cinema — онлайн-каталог фильмов</p>
      </footer>
    </div>
  );
}
