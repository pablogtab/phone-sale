import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { CurrentRoleService } from './current-role.service';
import { PermissionActions, PermissionType } from '../permissions';

export const HasPermissionGuard: CanActivateFn = (route) => {
    const router = inject(Router);
    const required = route.data['permission'] as
        | { permission: PermissionType; actions: PermissionActions[] }
        | undefined;
    return inject(CurrentRoleService).currentRole$.pipe(
        take(1),
        map((session) => {
            if (!session) return router.createUrlTree(['/login']);
            const allowed =
                session.role === 'admin' ||
                !required ||
                required.actions.every((action: PermissionActions) =>
                    session.permissions[required.permission]?.includes(action),
                );
            return allowed || router.createUrlTree(['/']);
        }),
    );
};
