import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      const hadToken = !!token;
      const isAuthEndpoint = req.url.includes('/api/auth/');
      const isOptionalRead =
        req.method === 'GET' && req.url.includes('/ratings/me');

      if (
        hadToken &&
        !isAuthEndpoint &&
        !isOptionalRead &&
        (err.status === 401 || err.status === 403)
      ) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
