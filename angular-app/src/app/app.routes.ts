import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
      { path: 'browse', loadComponent: () => import('./pages/browse/browse.component').then((m) => m.BrowseComponent) },
      { path: 'movie/:id', loadComponent: () => import('./pages/movie-detail/movie-detail.component').then((m) => m.MovieDetailComponent) },
      { path: 'my-list', canActivate: [authGuard], loadComponent: () => import('./pages/favorites/favorites.component').then((m) => m.FavoritesComponent) },
      { path: 'for-you', canActivate: [authGuard], loadComponent: () => import('./pages/recommendations/recommendations.component').then((m) => m.RecommendationsComponent) },
      { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent) },
    ],
  },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent) },
  { path: '**', redirectTo: '' },
];
