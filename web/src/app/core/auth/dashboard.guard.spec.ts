import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { CurrentRoleService } from './current-role.service';
import { dashboardGuard } from './dashboard.guard';

describe('dashboard authorization', () => {
    beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
    it('allows administrators', async () => {
        TestBed.inject(CurrentRoleService).setCurrentRole({ role: 'admin', permissions: {} });
        const result = TestBed.runInInjectionContext(() => dashboardGuard({} as never, {} as never));
        expect(await firstValueFrom(result as Observable<boolean | UrlTree>)).toBe(true);
    });
    it('redirects staff to inventory without exposing financial metrics', async () => {
        TestBed.inject(CurrentRoleService).setCurrentRole({ role: 'user', permissions: {} });
        const result = await firstValueFrom(TestBed.runInInjectionContext(() => dashboardGuard({} as never, {} as never)) as Observable<boolean | UrlTree>);
        expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/devices');
    });
});
