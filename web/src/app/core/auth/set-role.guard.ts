import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentRoleService } from './current-role.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { UserService } from '../api/user.service';

export const SetRoleGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserService);
    const router = inject(Router);
    const currentRoleService = inject(CurrentRoleService);

    return userService.getMyUser().pipe(
        tap((user) =>
            currentRoleService.setCurrentRole({
                permissions: user.permissions,
                role: user.role,
            }),
        ),
        switchMap(() => of(true)),
        catchError(() => of(false)),
        map((data) => data || router.createUrlTree(['/login'])),
    );
};
