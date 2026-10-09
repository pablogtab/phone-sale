import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
    provideHttpClientTesting,
    HttpTestingController,
} from '@angular/common/http/testing';
import { Title } from '@angular/platform-browser';
import { StoreComponent } from './store.component';
import { StoreSettingsService } from '../../../core/api/store-settings.service';

describe('configurable store name', () => {
    let http: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => http.verify());
    it('loads the public name and updates the browser title', async () => {
        const store = TestBed.inject(StoreSettingsService);
        const pending = store.load();
        http.expectOne('/api/store-settings').flush({ name: 'Nueva tienda' });
        await pending;
        TestBed.tick();
        expect(store.name()).toBe('Nueva tienda');
        expect(TestBed.inject(Title).getTitle()).toBe('Nueva tienda · Gestión');
    });
    it('saves a trimmed name once and updates the visible preview', () => {
        const fixture = TestBed.createComponent(StoreComponent);
        fixture.detectChanges();
        fixture.componentInstance.name.setValue('  Otra tienda  ');
        const submit = new Event('submit', { bubbles: true, cancelable: true });
        fixture.nativeElement.querySelector('form').dispatchEvent(submit);
        expect(submit.defaultPrevented).toBe(true);
        fixture.componentInstance.save();
        const request = http.expectOne('/api/store-settings');
        expect(request.request.body).toEqual({ name: 'Otra tienda' });
        request.flush({ name: 'Otra tienda' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('strong').textContent).toBe(
            'Otra tienda',
        );
        expect(TestBed.inject(Title).getTitle()).toBe('Otra tienda · Gestión');
    });
    it('preserves the old name and the draft on a failed save', () => {
        const fixture = TestBed.createComponent(StoreComponent);
        fixture.detectChanges();
        fixture.componentInstance.name.setValue('Mi nueva tienda');
        fixture.componentInstance.save();
        http.expectOne('/api/store-settings').flush(
            {},
            { status: 403, statusText: 'Forbidden' },
        );
        fixture.detectChanges();
        expect(fixture.componentInstance.store.name()).toBe('Mi tienda');
        expect(fixture.componentInstance.name.value).toBe('Mi nueva tienda');
        expect(fixture.componentInstance.saving()).toBe(false);
        expect(
            fixture.nativeElement.querySelector('[role="alert"]'),
        ).toBeTruthy();
    });
    it('retains the generic name when public settings are unavailable', async () => {
        const store = TestBed.inject(StoreSettingsService);
        const pending = store.load();
        http.expectOne('/api/store-settings').flush(
            {},
            { status: 503, statusText: 'Unavailable' },
        );
        await pending;
        expect(store.name()).toBe('Mi tienda');
    });
});
