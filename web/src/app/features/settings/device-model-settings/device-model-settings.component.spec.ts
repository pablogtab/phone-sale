import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
    provideHttpClientTesting,
    HttpTestingController,
} from '@angular/common/http/testing';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { DeviceModelSettingsComponent } from './device-model-settings.component';
import { MessagesService } from '@/app/core/api/messages.service';
import { model } from '@/testing/screen-fixtures';

describe('model catalog', () => {
    let http: HttpTestingController;
    let fixture: ReturnType<
        typeof TestBed.createComponent<DeviceModelSettingsComponent>
    >;
    let closed: Subject<unknown>;
    let dialog: { open: ReturnType<typeof vi.fn> };
    let messages: { error: ReturnType<typeof vi.fn> };
    beforeEach(() => {
        closed = new Subject();
        dialog = { open: vi.fn(() => ({ closed })) };
        messages = { error: vi.fn() };
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: MessagesService, useValue: messages },
            ],
        });
        fixture = TestBed.createComponent(DeviceModelSettingsComponent);
        dialog.open = vi
            .spyOn(fixture.debugElement.injector.get(Dialog), 'open')
            .mockReturnValue({ closed } as never);
        fixture.autoDetectChanges();
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
        try {
            http.verify();
        } finally {
            TestBed.resetTestingModule();
        }
    });
    const load = (data = [model]) =>
        http.expectOne('/api/devices/models?').flush(data);
    it('renders async results without another user interaction', async () => {
        expect(fixture.nativeElement.textContent).toContain('Cargando');
        load();
        await fixture.whenStable();
        expect(fixture.nativeElement.textContent).toContain('iPhone 8');
        expect(fixture.nativeElement.textContent).toContain('64 GB');
    });
    it('renders readable names without parentheses from existing catalog records', async () => {
        load([
            {
                ...model,
                name: 'iPhone SE (3rd generation)',
                availableColors: [
                    { ...model.availableColors[0], name: '(PRODUCT)RED' },
                ],
            },
        ]);
        await fixture.whenStable();
        expect(fixture.nativeElement.textContent).toContain(
            'iPhone SE 3rd generation',
        );
        expect(fixture.nativeElement.textContent).toContain('PRODUCT RED');
        expect(fixture.nativeElement.textContent).not.toMatch(/[()]/);
    });
    it('shows an explicit empty catalog', async () => {
        load([]);
        await fixture.whenStable();
        expect(fixture.nativeElement.textContent).toContain(
            'No hay modelos disponibles',
        );
    });
    it('shows a recoverable load error and retries from its button', async () => {
        http.expectOne('/api/devices/models?').flush(
            {},
            { status: 503, statusText: 'Unavailable' },
        );
        await fixture.whenStable();
        expect(
            fixture.nativeElement.querySelector('[role="alert"]'),
        ).toBeTruthy();
        [...fixture.nativeElement.querySelectorAll('button')]
            .find((b: HTMLElement) => b.textContent.includes('Reintentar'))
            .click();
        load();
        await fixture.whenStable();
        expect(fixture.nativeElement.textContent).toContain('iPhone 8');
        expect(
            fixture.nativeElement.querySelector('[role="alert"]'),
        ).toBeNull();
    });
    it('does not overwrite a newer reload with an older response', () => {
        const old = http.expectOne('/api/devices/models?');
        fixture.componentInstance.reloadData();
        load([{ ...model, name: 'iPhone 16' }]);
        old.flush([model]);
        expect(fixture.componentInstance.models[0].name).toBe('iPhone 16');
    });
    it.each([
        'newDeviceModel',
        'openColorSettings',
        'openStorageSizeSettings',
    ] as const)('reloads after %s closes', (method) => {
        load();
        fixture.componentInstance[method]();
        expect(dialog.open).toHaveBeenCalledOnce();
        closed.next(undefined);
        load([{ ...model, name: 'Updated' }]);
        expect(fixture.componentInstance.models[0].name).toBe('Updated');
    });
    it('moves the dragged item and preserves intermediate order', () => {
        const data = [model, { ...model, id: 2 }, { ...model, id: 3 }];
        load(data);
        fixture.componentInstance.drop({
            previousIndex: 0,
            currentIndex: 2,
        } as never);
        const request = http.expectOne('/api/devices/models/indexes');
        expect(request.request.body).toEqual({
            data: [
                { id: 2, index: 3 },
                { id: 3, index: 2 },
                { id: 1, index: 1 },
            ],
        });
        request.flush(null);
        load([data[1], data[2], data[0]]);
    });
    it('restores order if persistence fails and blocks overlapping saves', () => {
        load([model, { ...model, id: 2 }]);
        fixture.componentInstance.drop({
            previousIndex: 0,
            currentIndex: 1,
        } as never);
        fixture.componentInstance.drop({
            previousIndex: 1,
            currentIndex: 0,
        } as never);
        http.expectOne('/api/devices/models/indexes').flush(
            {},
            { status: 500, statusText: 'Error' },
        );
        expect(fixture.componentInstance.models.map((m) => m.id)).toEqual([
            1, 2,
        ]);
        expect(messages.error).toHaveBeenCalledOnce();
        expect(fixture.componentInstance.savingOrder()).toBe(false);
    });
    it('does not write for a drop at the same position', () => {
        load();
        fixture.componentInstance.drop({
            previousIndex: 0,
            currentIndex: 0,
        } as never);
        http.expectNone('/api/devices/models/indexes');
    });
    it('cancels pending HTTP when the view is destroyed', () => {
        const pending = http.expectOne('/api/devices/models?');
        fixture.destroy();
        expect(pending.cancelled).toBe(true);
    });
});
