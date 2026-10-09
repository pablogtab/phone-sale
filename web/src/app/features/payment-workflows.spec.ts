import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { cashEntity, bankEntity } from '@/testing/screen-fixtures';
import { dialogTest } from '@/testing/dialog-test-bed';
import { PurchasePaymentComponent } from './purchases/purchase-payment/purchase-payment.component';
import { NewOrderPaymentComponent } from './orders/edit-order/new-order-payment/new-order-payment.component';
import { SimpleAccountingTransactionComponent } from './accounting/simple-accounting-transaction/simple-accounting-transaction.component';
import { TransferAccountingTransactionComponent } from './accounting/transfer-accounting-transaction/transfer-accounting-transaction.component';

describe('payments and accounting workflows', () => {
    afterEach(() => {
        try {
            TestBed.inject(HttpTestingController).verify();
        } finally {
            TestBed.resetTestingModule();
        }
    });
    it('initializes a provider purchase payment and returns credit in USD', async () => {
        const t = dialogTest(PurchasePaymentComponent, { amount: 50 });
        await t.render();
        t.component.save();
        expect(t.ref.close).toHaveBeenCalledWith({
            type: 'credit',
            amount: 50,
            currency: 'usd',
            description: 'Cuenta Corriente',
            bankId: null,
            cashAccountId: null,
        });
    });
    it.each([0, -1, NaN, Infinity, null])(
        'rejects purchase amount %s even when save is called directly',
        async (amount) => {
            const t = dialogTest(PurchasePaymentComponent, { amount: 50 });
            await t.render();
            t.component.form.controls.amount.setValue(amount);
            expect(t.component.buttonEnabled).toBe(false);
            t.component.save();
            expect(t.ref.close).not.toHaveBeenCalled();
        },
    );
    it.each(['cash', 'bank'] as const)(
        'requires a %s destination',
        async (type) => {
            const t = dialogTest(PurchasePaymentComponent, { amount: 50 });
            await t.render();
            t.component.form.controls.type.setValue(type);
            t.component.save();
            expect(t.ref.close).not.toHaveBeenCalled();
            t.component.form.patchValue({
                currency: 'ars',
                [type === 'cash' ? 'cashAccount' : 'bank']: {
                    id: 3,
                    name: 'Destino Demo',
                },
            });
            t.component.save();
            expect(t.ref.close).toHaveBeenCalledWith(
                expect.objectContaining({
                    currency: 'ars',
                    [type === 'cash' ? 'cashAccountId' : 'bankId']: 3,
                    description: expect.stringContaining('Destino Demo'),
                }),
            );
        },
    );
    it('converts order payments using the configured exchange rate', async () => {
        const t = dialogTest(NewOrderPaymentComponent, {
            amountUSD: 50,
            exchangeRate: 1500,
            currency: 'usd',
        });
        await t.render();
        expect(t.component.form.controls.amountARS.value).toBe(75000);
        t.component.form.controls.currency.setValue('ars');
        t.component.form.controls.amountARS.setValue(30000);
        expect(t.component.form.controls.amountUSD.value).toBe(20);
        t.component.form.patchValue({
            paymentType: 'cash',
            cashAccount: cashEntity,
        });
        await t.component.save();
        expect(t.ref.close).toHaveBeenCalledWith(
            expect.objectContaining({
                cashAccountId: 1,
                amountUSD: 20,
                amountARS: 30000,
                currency: 'ars',
                exchangeRate: 1500,
            }),
        );
    });
    it('makes cashback negative once and disallows receiving a device as cashback', async () => {
        const t = dialogTest(NewOrderPaymentComponent, {
            amountUSD: 20,
            exchangeRate: 1500,
            currency: 'usd',
            cashback: true,
        });
        await t.render();
        expect(t.component.paymentTypes).not.toContain('device');
        t.component.form.patchValue({
            paymentType: 'cash',
            cashAccount: cashEntity,
        });
        await t.component.save();
        expect(t.ref.close).toHaveBeenCalledWith(
            expect.objectContaining({
                amountUSD: -20,
                amountARS: -30000,
                description: 'Devolución -> Caja: Caja Demo',
            }),
        );
    });
    it.each([0, -10, NaN, Infinity])(
        'rejects invalid order payment %s',
        async (amount) => {
            const t = dialogTest(NewOrderPaymentComponent, {
                amountUSD: 20,
                exchangeRate: 1500,
                currency: 'usd',
            });
            await t.render();
            t.component.form.patchValue({
                amountUSD: amount,
                paymentType: 'cash',
                cashAccount: cashEntity,
            });
            await t.component.save();
            expect(t.ref.close).not.toHaveBeenCalled();
        },
    );
    it('requires a valid exchange rate and payment destination', async () => {
        const t = dialogTest(NewOrderPaymentComponent, {
            amountUSD: 20,
            exchangeRate: 1500,
            currency: 'usd',
        });
        await t.render();
        await t.component.save();
        expect(t.ref.close).not.toHaveBeenCalled();
        t.component.form.patchValue({
            exchangeRate: 0,
            paymentType: 'cash',
            cashAccount: cashEntity,
        });
        expect(t.component.isValidForm()).toBe(false);
    });
    it('requires confirmation for a USD bank transfer', async () => {
        const t = dialogTest(NewOrderPaymentComponent, {
            amountUSD: 20,
            exchangeRate: 1500,
            currency: 'usd',
        });
        await t.render();
        t.component.form.patchValue({
            paymentType: 'bank_transfer',
            transferAccountType: 'bank',
            bank: bankEntity,
        });
        await t.component.save();
        expect(t.messages.question).toHaveBeenCalledOnce();
        expect(t.ref.close).not.toHaveBeenCalled();
        t.messages.question.mockResolvedValue(true);
        await t.component.save();
        expect(t.ref.close).toHaveBeenCalledWith(
            expect.objectContaining({ bankId: 2, amountUSD: 20 }),
        );
    });
    it.each(['credit', 'debit'] as const)(
        'posts a signed %s movement to the selected account',
        async (direction) => {
            const t = dialogTest(SimpleAccountingTransactionComponent, {
                title: 'Movimiento',
                type: 'cash_account',
                entityId: 1,
            });
            await t.render();
            t.component.form.patchValue({
                amount: 50,
                currency: 'usd',
                transactionSelected: direction,
                details: 'Ajuste',
            });
            t.component.save();
            const request = t.http.expectOne(
                '/api/accounting/simple-transaction',
            );
            expect(request.request.body).toEqual({
                accountType: 'cash_account',
                cashAccountId: 1,
                amount: direction === 'credit' ? 50 : -50,
                currency: 'usd',
                details: 'Ajuste',
            });
            request.flush(null);
            expect(t.ref.close).toHaveBeenCalledOnce();
        },
    );
    it('rejects incomplete accounting movements', async () => {
        const t = dialogTest(SimpleAccountingTransactionComponent, {
            title: 'Movimiento',
            type: 'cash_account',
            entityId: 1,
        });
        await t.render();
        t.component.save();
        t.http.expectNone('/api/accounting/simple-transaction');
        expect(t.ref.close).not.toHaveBeenCalled();
    });
    it('converts transfer amounts in both directions and follows manual rate changes', async () => {
        const t = dialogTest(TransferAccountingTransactionComponent, {
            title: 'Transferencia',
        });
        await t.render();
        t.component.amountUSD.setValue(10);
        expect(t.component.amountARS.value).toBe(15000);
        t.component.amountARS.setValue(30000);
        expect(t.component.amountUSD.value).toBe(20);
        t.component.exchangeRate.setValue(2000);
        expect(t.component.amountARS.value).toBe(40000);
    });
    it('posts source and destination amounts in their own currencies after confirmation', async () => {
        const t = dialogTest(TransferAccountingTransactionComponent, {
            title: 'Transferencia',
        });
        await t.render();
        t.component.formA.patchValue({
            transferAccountType: 'cash_account',
            cash_account: cashEntity,
            currency: 'usd',
        });
        t.component.formB.patchValue({
            transferAccountType: 'bank',
            bank: bankEntity,
            currency: 'ars',
        });
        t.component.amountUSD.setValue(10);
        await t.component.save();
        t.http.expectNone('/api/accounting/transfer');
        t.messages.question.mockResolvedValue(true);
        await t.component.save();
        const request = t.http.expectOne('/api/accounting/transfer');
        expect(request.request.body).toEqual({
            origin: {
                entityId: 1,
                type: 'cash_account',
                amount: 10,
                currency: 'usd',
            },
            destination: {
                entityId: 2,
                type: 'bank',
                amount: 15000,
                currency: 'ars',
            },
            details: 'Transferencia',
            exchangeRate: 1500,
        });
        request.flush(null);
        expect(t.ref.close).toHaveBeenCalledOnce();
    });
});
