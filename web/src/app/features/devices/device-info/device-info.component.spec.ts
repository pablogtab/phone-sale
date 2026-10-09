import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Dialog } from '@angular/cdk/dialog';
import { vi } from 'vitest';
import { Subject } from 'rxjs';
import { dialogTest } from '@/testing/dialog-test-bed';
import { device } from '@/testing/screen-fixtures';
import { DeviceInfoComponent } from './device-info.component';
describe('device detail presentation and actions', () => {
    afterEach(() => {
        try {
            TestBed.inject(HttpTestingController).verify();
        } finally {
            TestBed.resetTestingModule();
        }
    });
    it('shows Spanish status, model variants and an explicit empty history', async () => {
        const t = dialogTest(DeviceInfoComponent, { deviceId: 1 });
        await t.render();
        const text = t.fixture.nativeElement.textContent;
        expect(text).toContain('Disponible');
        expect(text).not.toContain('AVAILABLE');
        expect(text).toContain('64 GB');
        expect(text).toContain('Todavía no hay movimientos');
        expect(text).not.toContain('Vender');
    });
    it('opens the edit dialog from the visible edit action', async () => {
        const t = dialogTest(DeviceInfoComponent, { deviceId: 1 });
        await t.render();
        const closed = new Subject();
        const open = vi
            .spyOn(t.fixture.debugElement.injector.get(Dialog), 'open')
            .mockReturnValue({ closed } as never);
        [...t.fixture.nativeElement.querySelectorAll('button')]
            .find((button: HTMLElement) =>
                button.textContent.includes('Editar equipo'),
            )
            .click();
        expect(open).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                data: { deviceId: 1, title: 'Editar equipo' },
            }),
        );
    });
    it('shows a failed load and retries without requiring the dialog to close', async () => {
        const t = dialogTest(DeviceInfoComponent, { deviceId: 1 });
        t.http
            .expectOne('/api/devices/devices/1')
            .flush({}, { status: 503, statusText: 'Unavailable' });
        await t.fixture.whenStable();
        expect(
            t.fixture.nativeElement.querySelector('[role="alert"]'),
        ).toBeTruthy();
        t.fixture.nativeElement.querySelector('[role="alert"] button').click();
        t.http.expectOne('/api/devices/devices/1').flush(device);
        await t.fixture.whenStable();
        expect(t.fixture.nativeElement.textContent).toContain('iPhone 8');
    });
    it('renders history without a user relation and preserves comment line breaks', async () => {
        const t = dialogTest(DeviceInfoComponent, { deviceId: 1 });
        t.http
            .expectOne('/api/devices/devices/1')
            .flush({
                ...device,
                internalComments: 'Primera línea\nSegunda línea',
                deviceHistory: [
                    {
                        id: 1,
                        date: '2026-10-09T12:00:00Z',
                        description: 'Recibido',
                        user: null,
                    },
                ],
            });
        await t.fixture.whenStable();
        expect(
            t.fixture.nativeElement.querySelector('ol').textContent,
        ).toContain('Recibido');
        expect(t.fixture.nativeElement.textContent).toContain(
            'Primera línea\nSegunda línea',
        );
    });
    it('shows zero purchase cost and closes from the accessible close button', async () => {
        const t = dialogTest(DeviceInfoComponent, { deviceId: 1 });
        t.http
            .expectOne('/api/devices/devices/1')
            .flush({ ...device, purchasePrice: 0 });
        await t.fixture.whenStable();
        expect(t.fixture.nativeElement.textContent).toContain(
            'Precio de compra',
        );
        t.fixture.nativeElement
            .querySelector('[aria-label="Cerrar diálogo"]')
            .click();
        expect(t.ref.close).toHaveBeenCalledOnce();
    });
});
