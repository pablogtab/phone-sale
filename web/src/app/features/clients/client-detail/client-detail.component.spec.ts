import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { MessagesService } from '@/app/core/api/messages.service';
import { customer } from '@/testing/screen-fixtures';
import { ClientDetailComponent } from './client-detail.component';
describe('client detail editing', () => {
    let fixture: ReturnType<
        typeof TestBed.createComponent<ClientDetailComponent>
    >;
    let http: HttpTestingController;
    const messages = {
        success: vi.fn(),
        error: vi.fn(),
        showPublicError: vi.fn(),
        question: vi.fn().mockResolvedValue(false),
    };
    beforeEach(() => {
        vi.clearAllMocks();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: MessagesService, useValue: messages },
            ],
        });
        fixture = TestBed.createComponent(ClientDetailComponent);
        fixture.componentRef.setInput('id', 'customer-1');
        fixture.autoDetectChanges();
        http = TestBed.inject(HttpTestingController);
        http.expectOne('/api/clients/customer-1').flush(customer);
    });
    afterEach(() => {
        try {
            http.verify();
        } finally {
            TestBed.resetTestingModule();
        }
    });
    it('loads fetched values into a disabled form without another click', async () => {
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('input').value).toBe(
            'Ana Demo',
        );
        expect(fixture.componentInstance.clientForm.disabled).toBe(true);
    });
    it('cancel restores the stored customer and disables editing', () => {
        const c = fixture.componentInstance;
        c.edit();
        c.clientForm.controls.name.setValue('Changed');
        c.cancel();
        expect(c.clientForm.controls.name.value).toBe('Ana Demo');
        expect(c.clientForm.disabled).toBe(true);
    });
    it('saves phone, wholesale and label changes to the selected public ID', () => {
        const c = fixture.componentInstance;
        c.edit();
        c.clientForm.patchValue({
            name: 'Ana Nueva',
            whatsapp: '3511111111',
            wholesaler: true,
            birthDate: '',
        });
        c.save();
        const request = http.expectOne('/api/clients/customer-1');
        expect(request.request.method).toBe('PATCH');
        expect(request.request.body).toEqual(
            expect.objectContaining({
                name: 'Ana Nueva',
                phoneNumber: '3511111111',
                wholesaler: true,
                birthDate: null,
            }),
        );
        request.flush({ ...customer, name: 'Ana Nueva' });
        expect(c.clientForm.disabled).toBe(true);
        expect(c.client.name).toBe('Ana Nueva');
    });
    it('blocks an empty customer name before writing', () => {
        const c = fixture.componentInstance;
        c.edit();
        c.clientForm.controls.name.setValue('   ');
        c.save();
        http.expectNone('/api/clients/customer-1');
        expect(messages.error).toHaveBeenCalledOnce();
    });
    it('keeps edits available after a server failure', () => {
        const c = fixture.componentInstance;
        c.edit();
        c.clientForm.controls.name.setValue('Ana Nueva');
        c.save();
        http.expectOne('/api/clients/customer-1').flush(
            {},
            { status: 409, statusText: 'Conflict' },
        );
        expect(c.clientForm.enabled).toBe(true);
        expect(c.clientForm.controls.name.value).toBe('Ana Nueva');
        expect(messages.showPublicError).toHaveBeenCalledOnce();
    });
    it('cancelling deletion does not send a request', async () => {
        await fixture.componentInstance.deleteClient();
        http.expectNone('/api/clients/customer-1');
    });
});
