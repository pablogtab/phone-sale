import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
    provideHttpClientTesting,
    HttpTestingController,
} from '@angular/common/http/testing';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { ClientsComponent } from './clients.component';
import { FilterService } from '../../core/api/filter.service';

describe('client list refresh', () => {
    let http: HttpTestingController;
    let closed: Subject<any>;
    beforeEach(() => {
        closed = new Subject();
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: Dialog, useValue: { open: () => ({ closed }) } },
                {
                    provide: FilterService,
                    useValue: {
                        getParamsFromUrl: () => ({}),
                        saveStateToUrl: vi.fn(),
                    },
                },
            ],
        });
        TestBed.overrideProvider(Dialog, {
            useValue: { open: () => ({ closed }) },
        });
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => http.verify());
    function screen() {
        const fixture = TestBed.createComponent(ClientsComponent);
        vi.spyOn(
            fixture.debugElement.injector.get(Dialog),
            'open',
        ).mockReturnValue({ closed } as any);
        fixture.detectChanges();
        return fixture;
    }
    const result = (data: any[] = []) => ({
        data,
        page: 1,
        totalPages: data.length ? 1 : 0,
        totalRows: data.length,
    });
    it('reloads the list after the dialog creates a client without creating it twice', () => {
        const fixture = screen();
        http.expectOne((req) => req.url.split('?')[0] === '/api/clients').flush(
            result(),
        );
        fixture.componentInstance.openModalAddClient();
        closed.next({ name: 'Ana', publicId: 'new-client' });
        http.expectNone((req) => req.method === 'POST');
        http.expectOne((req) => req.url.split('?')[0] === '/api/clients').flush(
            result([{ name: 'Ana', publicId: 'new-client' }]),
        );
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Ana');
        expect(fixture.componentInstance.totalRows).toBe(1);
    });
    it('ignores a cancelled dialog and cancels stale list requests', () => {
        const fixture = screen();
        const old = http.expectOne(
            (req) => req.url.split('?')[0] === '/api/clients',
        );
        fixture.componentInstance.searchClients();
        expect(old.cancelled).toBe(true);
        http.expectOne((req) => req.url.split('?')[0] === '/api/clients').flush(
            result(),
        );
        fixture.componentInstance.openModalAddClient();
        closed.next(undefined);
        http.expectNone((req) => req.url.split('?')[0] === '/api/clients');
        expect(fixture.componentInstance.loading()).toBe(false);
    });
    it('shows an error state and recovers on retry', () => {
        const fixture = screen();
        http.expectOne((req) => req.url.split('?')[0] === '/api/clients').flush(
            {},
            { status: 500, statusText: 'Failed' },
        );
        fixture.detectChanges();
        expect(fixture.componentInstance.failed()).toBe(true);
        fixture.componentInstance.searchClients();
        http.expectOne((req) => req.url.split('?')[0] === '/api/clients').flush(
            result(),
        );
        fixture.detectChanges();
        expect(fixture.componentInstance.failed()).toBe(false);
        expect(fixture.nativeElement.textContent).toContain('No hay clientes');
    });
});
