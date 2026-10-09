import { TestBed } from '@angular/core/testing';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    provideRouter,
} from '@angular/router';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { HasPermissionGuard } from './has-permission.guard';
import { CurrentRoleService } from './current-role.service';
import { isAuthenticated } from './is-authenticated';
import { authInterceptor } from './auth.interceptor';
import { LOCAL_STORAGE_TOKEN_KEY } from '../const';

const state = {} as RouterStateSnapshot;
const route = {
    data: { permission: { permission: 'clients', actions: ['read'] } },
} as unknown as ActivatedRouteSnapshot;

describe('session and permissions', () => {
    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
    });
    afterEach(() => localStorage.clear());

    it('redirects an absent session to login', () => {
        const result = TestBed.runInInjectionContext(() =>
            isAuthenticated(route, state),
        );
        expect(TestBed.inject(Router).serializeUrl(result as any)).toBe(
            '/login',
        );
    });
    it('allows a stored session through the authentication guard', () => {
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, 'session');
        expect(
            TestBed.runInInjectionContext(() => isAuthenticated(route, state)),
        ).toBe(true);
    });
    it('allows admins without explicit permissions', async () => {
        TestBed.inject(CurrentRoleService).setCurrentRole({
            role: 'admin',
            permissions: {},
        });
        const result = TestBed.runInInjectionContext(() =>
            HasPermissionGuard(route, state),
        );
        expect(await firstValueFrom(result as any)).toBe(true);
    });
    it('redirects a missing role to login', async () => {
        const result = TestBed.runInInjectionContext(() =>
            HasPermissionGuard(route, state),
        );
        const value = await firstValueFrom(result as any);
        expect(TestBed.inject(Router).serializeUrl(value as any)).toBe(
            '/login',
        );
    });
    it('denies a permission absent from a regular user role', async () => {
        TestBed.inject(CurrentRoleService).setCurrentRole({
            role: 'user',
            permissions: {},
        } as any);
        const result = TestBed.runInInjectionContext(() =>
            HasPermissionGuard(route, state),
        );
        expect(
            TestBed.inject(Router).serializeUrl(
                (await firstValueFrom(result as any)) as any,
            ),
        ).toBe('/');
    });
    it('allows an explicitly assigned action', async () => {
        TestBed.inject(CurrentRoleService).setCurrentRole({
            role: 'user',
            permissions: { clients: ['read'] },
        } as any);
        const result = TestBed.runInInjectionContext(() =>
            HasPermissionGuard(route, state),
        );
        expect(await firstValueFrom(result as any)).toBe(true);
    });
    it('attaches a token only to the local API', async () => {
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, 'session');
        for (const [url, expected] of [
            ['/api/devices', 'Bearer session'],
            ['https://external.example/data', null],
        ]) {
            let authorization: string | null = null;
            await firstValueFrom(
                authInterceptor(new HttpRequest('GET', url), (request) => {
                    authorization = request.headers.get('Authorization');
                    return of(new HttpResponse({ status: 200 }));
                }),
            );
            expect(authorization).toBe(expected);
        }
    });
});
