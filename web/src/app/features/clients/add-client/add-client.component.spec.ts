import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
    provideHttpClientTesting,
    HttpTestingController,
} from '@angular/common/http/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { vi } from 'vitest';
import { AddClientComponent } from './add-client.component';
import { MessagesService } from '../../../core/api/messages.service';

describe('new client dialog', () => {
    let http: HttpTestingController;
    let dialog: { close: ReturnType<typeof vi.fn>; disableClose: boolean };
    beforeEach(() => {
        dialog = { close: vi.fn(), disableClose: false };
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: DIALOG_DATA, useValue: { title: 'Nuevo cliente' } },
                { provide: DialogRef, useValue: dialog },
                { provide: MessagesService, useValue: { success: vi.fn() } },
            ],
        });
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => http.verify());
    it('blocks duplicate submits and returns the saved entity to the list', () => {
        const fixture = TestBed.createComponent(AddClientComponent);
        fixture.detectChanges();
        fixture.componentInstance.clientForm.controls.name.setValue('  Ana  ');
        fixture.componentInstance.save();
        fixture.componentInstance.save();
        const request = http.expectOne('/api/clients');
        expect(request.request.body).toEqual({ name: 'Ana' });
        expect(dialog.disableClose).toBe(true);
        const saved = { name: 'Ana', publicId: 'created' };
        request.flush(saved);
        expect(dialog.close).toHaveBeenCalledExactlyOnceWith(saved);
        expect(dialog.disableClose).toBe(false);
    });
    it('keeps entered data and the dialog open after a server error', () => {
        const fixture = TestBed.createComponent(AddClientComponent);
        fixture.detectChanges();
        fixture.componentInstance.clientForm.controls.name.setValue('Ana');
        fixture.componentInstance.save();
        http.expectOne('/api/clients').flush(
            {},
            { status: 500, statusText: 'Failed' },
        );
        fixture.detectChanges();
        expect(dialog.close).not.toHaveBeenCalled();
        expect(fixture.componentInstance.clientForm.controls.name.value).toBe(
            'Ana',
        );
        expect(fixture.componentInstance.saving()).toBe(false);
        expect(
            fixture.nativeElement.querySelector('[role="alert"]'),
        ).toBeTruthy();
    });
    it('does not send whitespace-only names', () => {
        const fixture = TestBed.createComponent(AddClientComponent);
        fixture.componentInstance.clientForm.controls.name.setValue('   ');
        fixture.componentInstance.save();
        http.expectNone('/api/clients');
    });
});
