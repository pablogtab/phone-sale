import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Dialog } from '@angular/cdk/dialog';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';
import { PurchasesComponent } from './purchases.component';
import { PurchasesService } from '../../core/api/purchases.service';
import { MessagesService } from '../../core/api/messages.service';
import { ParameterService } from '../../core/api/parameter.service';
import { DeviceModelService } from '../../core/api/device-model.service';
import { DevicePriceReferenceService } from '../../core/api/device-price-reference.service';

describe('purchase drafts', () => {
    let response: Subject<any>;
    let save: ReturnType<typeof vi.fn>;
    let confirm: ReturnType<typeof vi.fn>;
    beforeEach(() => {
        response = new Subject();
        save = vi.fn(() => response);
        confirm = vi.fn(async () => true);
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                { provide: Dialog, useValue: {} },
                { provide: PurchasesService, useValue: { new: save } },
                {
                    provide: MessagesService,
                    useValue: { question: confirm, error: vi.fn() },
                },
                {
                    provide: ParameterService,
                    useValue: { getParameter: () => of({ valueN: 1000 }) },
                },
                {
                    provide: DeviceModelService,
                    useValue: {
                        get: () =>
                            of({
                                availableColors: [{ id: 1 }],
                                availableStorageSizes: [{ id: 1 }],
                            }),
                    },
                },
                {
                    provide: DevicePriceReferenceService,
                    useValue: { find: () => of(null) },
                },
            ],
        });
    });
    function draft() {
        const fixture = TestBed.createComponent(PurchasesComponent);
        const component = fixture.componentInstance;
        component.ngAfterViewInit();
        component.form.controls.provider.setValue({ id: 1 } as any);
        component.rows = [
            {
                product: { id: 1 } as any,
                description: 'Cable',
                quantity: 2,
                price: 5,
            },
        ];
        component.payments = [
            {
                amount: 10,
                amountUSD: 10,
                amountARS: 10000,
                currency: 'usd',
                type: 'credit',
                description: 'Crédito',
            },
        ];
        return { fixture, component };
    }
    it('blocks double confirmation and double requests while saving', async () => {
        const { component } = draft();
        const pending = component.onSave();
        await component.onSave();
        await pending;
        expect(confirm).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledTimes(1);
        await component.onSave();
        expect(save).toHaveBeenCalledTimes(1);
        response.next({});
        response.complete();
        expect(component.rows).toEqual([]);
        expect(component.payments).toEqual([]);
        expect(component.saving()).toBe(false);
        expect(component.form.controls.provider.value.id).toBe(1);
        expect(component.form.controls.exchangeRate.value).toBe(1000);
    });
    it('keeps items and payments intact on failure and permits retry', async () => {
        const { component } = draft();
        await component.onSave();
        response.error(new Error('Failed'));
        expect(component.rows).toHaveLength(1);
        expect(component.payments).toHaveLength(1);
        expect(component.saving()).toBe(false);
        expect(component.form.enabled).toBe(true);
        expect(component.error()).toContain('Conservamos');
    });
    it('recomputes ARS payments when the manually entered exchange rate changes', () => {
        const { component } = draft();
        component.payments = [
            {
                amount: 10000,
                amountARS: 10000,
                amountUSD: 10,
                currency: 'ars',
                type: 'cash',
                description: 'Caja',
                cashAccountId: 1,
            },
        ];
        component.form.controls.exchangeRate.setValue(2000);
        expect(component.payments[0].amountUSD).toBe(5);
        expect(component.balance).toBe(5);
        expect(component.disabledSave).toBe(true);
    });
    it('lets catalog models without prices start at zero without crashing', () => {
        const { component } = draft();
        expect(() =>
            component.form.controls.model.setValue({ id: 1 } as any),
        ).not.toThrow();
        expect(component.form.controls.price.value).toBe(0);
    });
    it('does not discard a draft when confirmation is cancelled', async () => {
        confirm.mockResolvedValue(false);
        const { component } = draft();
        await component.onSave();
        expect(save).not.toHaveBeenCalled();
        expect(component.rows).toHaveLength(1);
        expect(component.saving()).toBe(false);
    });
});
