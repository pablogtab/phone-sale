import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { CurrentRoleService } from './current-role.service';

export const dashboardGuard: CanActivateFn = () => {
    const router = inject(Router);
    return inject(CurrentRoleService).currentRole$.pipe(
        take(1),
        map(user => user?.role === 'admin' || router.createUrlTree(['/devices'])),
    );
};
