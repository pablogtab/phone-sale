import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
    provideHttpClientTesting,
    HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { LoginComponent } from './login.component';
import { LOCAL_STORAGE_TOKEN_KEY } from '../../core/const';

describe('login form', () => {
    let http: HttpTestingController;
    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
            ],
        });
        http = TestBed.inject(HttpTestingController);
        vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(
            true,
        );
    });
    afterEach(() => {
        http.verify();
        localStorage.clear();
    });
    it('requires both fields without sending credentials', async () => {
        const fixture = TestBed.createComponent(LoginComponent);
        fixture.autoDetectChanges();
        fixture.nativeElement
            .querySelector('form')
            .dispatchEvent(
                new Event('submit', { bubbles: true, cancelable: true }),
            );
        await fixture.whenStable();
        expect(
            fixture.nativeElement.querySelector('[role="alert"]').textContent,
        ).toContain('Completá');
        http.expectNone('/api/login/username');
    });
    it('submits once, stores the returned session and navigates to inventory', async () => {
        const fixture = TestBed.createComponent(LoginComponent);
        fixture.autoDetectChanges();
        fixture.componentInstance.form.setValue({
            username: ' admin ',
            password: 'demo-password',
        });
        fixture.nativeElement
            .querySelector('form')
            .dispatchEvent(
                new Event('submit', { bubbles: true, cancelable: true }),
            );
        fixture.componentInstance.login();
        const request = http.expectOne('/api/login/username');
        expect(request.request.body).toEqual({
            username: 'admin',
            password: 'demo-password',
        });
        request.flush({
            token: 'new-session',
            user: { role: 'admin', permissions: {} },
        });
        await fixture.whenStable();
        expect(localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)).toBe(
            'new-session',
        );
        expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/');
    });
    it('shows server validation errors and enables another attempt', async () => {
        const fixture = TestBed.createComponent(LoginComponent);
        fixture.autoDetectChanges();
        fixture.componentInstance.form.setValue({
            username: 'admin',
            password: 'wrong',
        });
        fixture.componentInstance.login();
        http.expectOne('/api/login/username').flush(
            { public: true, message: 'Credenciales incorrectas' },
            { status: 400, statusText: 'Invalid' },
        );
        await fixture.whenStable();
        expect(fixture.nativeElement.textContent).toContain(
            'Credenciales incorrectas',
        );
        expect(
            fixture.nativeElement.querySelector('button[type="submit"]')
                .disabled,
        ).toBe(false);
        expect(localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)).toBeNull();
    });
    it('toggles password visibility without submitting the form', async () => {
        const fixture = TestBed.createComponent(LoginComponent);
        fixture.autoDetectChanges();
        fixture.nativeElement
            .querySelector('[aria-label="Mostrar contraseña"]')
            .click();
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('#password').type).toBe(
            'text',
        );
        http.expectNone('/api/login/username');
    });
    it('redirects an existing session away from login', () => {
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, 'existing');
        const fixture = TestBed.createComponent(LoginComponent);
        fixture.detectChanges();
        expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/');
    });
});
