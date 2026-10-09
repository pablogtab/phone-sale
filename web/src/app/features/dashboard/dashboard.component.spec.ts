import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { dashboardFixture } from '../../../testing/dashboard-fixture';

describe('dashboard', () => {
    let http: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }, provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => http.verify());
    const request = () => http.expectOne(req => req.url === '/api/dashboard');
    function screen() {
        const fixture = TestBed.createComponent(DashboardComponent);
        fixture.detectChanges();
        return fixture;
    }
    it('loads 30 days and shows distinct currencies, stock, balances and order links', () => {
        const fixture = screen();
        expect(fixture.nativeElement.textContent).toContain('Cargando métricas');
        const req = request();
        expect(req.request.params.get('days')).toBe('30');
        req.flush(dashboardFixture);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('250,00');
        expect(fixture.nativeElement.textContent).toContain('375.000,00 ARS');
        expect(fixture.nativeElement.textContent).toContain('Ana Demo');
        expect(fixture.nativeElement.querySelector('.recent-orders a').getAttribute('href')).toBe('/orders/order/order-1');
        expect(fixture.nativeElement.querySelectorAll('.stock-list li').length).toBe(6);
        expect(fixture.nativeElement.querySelector('.chart [role="listitem"]').getAttribute('aria-label')).toContain('08/10: 0,00 USD');
    });
    it('changes the period and cancels the previous request so stale data cannot overwrite it', () => {
        const fixture = screen();
        const initial = request();
        const select = fixture.nativeElement.querySelector('select');
        select.value = '7'; select.dispatchEvent(new Event('change'));
        expect(initial.cancelled).toBe(true);
        const current = request();
        expect(current.request.params.get('days')).toBe('7');
        current.flush({ ...dashboardFixture, period: { ...dashboardFixture.period, days: 7 } });
        fixture.detectChanges();
        expect(fixture.componentInstance.days()).toBe(7);
        expect(fixture.componentInstance.loading()).toBe(false);
    });
    it('shows failures and retries through the visible button', () => {
        const fixture = screen();
        request().flush({}, { status: 500, statusText: 'Error' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No pudimos');
        fixture.nativeElement.querySelector('[role="alert"] button').click();
        request().flush(dashboardFixture);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Ana Demo');
    });
    it('refreshes using the selected period', () => {
        const fixture = screen(); request().flush(dashboardFixture); fixture.detectChanges();
        fixture.nativeElement.querySelector('.refresh-button').click();
        expect(request().request.params.get('days')).toBe('30');
        fixture.destroy();
    });
    it('explains an empty period, zero totals and an unconfigured exchange rate', () => {
        const fixture = screen();
        request().flush({ ...dashboardFixture, sales: { orders: 0, units: 0, totalUSD: 0, totalARS: 0, averageUSD: 0 }, recentOrders: [], exchangeRate: null });
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Sin ventas completadas');
        expect(fixture.nativeElement.textContent).toContain('No hay órdenes');
        expect(fixture.nativeElement.textContent).toContain('Sin configurar');
        expect(fixture.nativeElement.querySelector('.chart')).toBeNull();
        expect(fixture.componentInstance.hasSales()).toBe(false);
    });
    it('renders null customers, all statuses and accessible zero-value bars', () => {
        const fixture = screen();
        request().flush({ ...dashboardFixture, recentOrders: ['pending','deposited','cancelled','other'].map((status, i) => ({ ...dashboardFixture.recentOrders[0], publicId: `order-${i}`, clientName: null as string | null, status })) });
        fixture.detectChanges();
        for (const text of ['Sin cliente', 'Pendiente', 'Señada', 'Cancelada', 'other']) expect(fixture.nativeElement.textContent).toContain(text);
        expect(fixture.componentInstance.maxSale()).toBe(250);
        expect(fixture.nativeElement.querySelector('.chart-bar.zero')).not.toBeNull();
    });
    it('unsubscribes a pending request on destruction', () => {
        const fixture = screen(); const req = request(); fixture.destroy(); expect(req.cancelled).toBe(true);
    });
});
