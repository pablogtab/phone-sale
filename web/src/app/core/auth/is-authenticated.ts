import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LOCAL_STORAGE_TOKEN_KEY } from '../const';

export const isAuthenticated: CanActivateFn = () =>
    localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
        ? true
        : inject(Router).createUrlTree(['/login']);
