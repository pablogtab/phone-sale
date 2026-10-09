import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
    provideHttpClientTesting,
    HttpTestingController,
} from '@angular/common/http/testing';
import { DolarComponent } from './dolar.component';

describe('manual exchange rate', () => {
    let http: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => http.verify());
    function screen() {
        const fixture = TestBed.createComponent(DolarComponent);
        fixture.detectChanges();
        http.expectOne('/api/parameters/dolar_hoy_cba_price').flush({
            valueN: 1000,
            updatedAt: '2026-10-09T12:00:00Z',
        });
        fixture.detectChanges();
        return fixture;
    }
    it('saves the entered rate once and displays the persisted value', () => {
        const fixture = screen();
        const component = fixture.componentInstance;
        component.rate.setValue(1500);
        const submit = new Event('submit', { bubbles: true, cancelable: true });
        fixture.nativeElement.querySelector('form').dispatchEvent(submit);
        expect(submit.defaultPrevented).toBe(true);
        component.save();
        const request = http.expectOne('/api/parameters/dolar_hoy_cba_price');
        expect(request.request.method).toBe('PATCH');
        expect(request.request.body).toEqual({ valueN: 1500 });
        expect(component.saving()).toBe(true);
        request.flush({ valueN: 1500, updatedAt: '2026-10-09T13:00:00Z' });
        fixture.detectChanges();
        expect(component.dolar).toBe(1500);
        expect(
            fixture.nativeElement.querySelector('[role="status"]').textContent,
        ).toContain('Cotización guardada');
        expect(component.saving()).toBe(false);
    });
    it('rejects zero, negative and excessively large rates without a request', () => {
        const component = screen().componentInstance;
        for (const value of [0, -1, 100000001]) {
            component.rate.setValue(value);
            component.save();
        }
        http.expectNone('/api/parameters/dolar_hoy_cba_price');
    });
    it('preserves the draft and allows retry after a failed save', () => {
        const fixture = screen();
        const component = fixture.componentInstance;
        component.rate.setValue(1800);
        component.save();
        http.expectOne('/api/parameters/dolar_hoy_cba_price').flush(
            {},
            { status: 500, statusText: 'Failure' },
        );
        fixture.detectChanges();
        expect(component.rate.value).toBe(1800);
        expect(component.dolar).toBe(1000);
        expect(component.saving()).toBe(false);
        expect(
            fixture.nativeElement.querySelector('[role="alert"]').textContent,
        ).toContain('Tus cambios');
        component.save();
        http.expectOne('/api/parameters/dolar_hoy_cba_price').flush({
            valueN: 1800,
            updatedAt: '2026-10-09',
        });
    });
    it('offers a retry when the initial load fails', () => {
        const fixture = TestBed.createComponent(DolarComponent);
        fixture.detectChanges();
        http.expectOne('/api/parameters/dolar_hoy_cba_price').flush(
            {},
            { status: 503, statusText: 'Unavailable' },
        );
        expect(fixture.componentInstance.failed()).toBe(true);
        fixture.componentInstance.load();
        http.expectOne('/api/parameters/dolar_hoy_cba_price').flush({
            valueN: 1200,
            updatedAt: '2026-10-09',
        });
        expect(fixture.componentInstance.failed()).toBe(false);
        expect(fixture.componentInstance.rate.value).toBe(1200);
    });
});
