import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { dialogTest } from '@/testing/dialog-test-bed';
import { customer, product, order, page } from '@/testing/screen-fixtures';
import { Client } from '@/app/core/models/client';
import { OrderAndDetails } from '@/app/core/api/orders.service';
import { EditOrderComponent } from './edit-order/edit-order.component';
import { OrdersComponent } from './orders.component';
async function newSale() {
    const t = dialogTest(EditOrderComponent);
    await t.render();
    t.component.form.controls.client.setValue(customer as Client);
    vi.spyOn(t.component.router, 'navigate').mockResolvedValue(true);
    return t;
}
async function addAccessory(
    t: Awaited<ReturnType<typeof newSale>>,
    quantity = 2,
) {
    t.component.form.controls.accesory.setValue(product);
    t.http.expectOne('/api/products/price/').flush({ price: 10 });
    await t.fixture.whenStable();
    t.component.form.controls.quantity.setValue(quantity);
    t.component.addProduct();
}
describe('sales workflows', () => {
    afterEach(() => {
        try {
            TestBed.inject(HttpTestingController).verify();
        } finally {
            TestBed.resetTestingModule();
        }
    });
    it('prices an accessory, adds quantity, clears selection and updates totals', async () => {
        const t = await newSale();
        await addAccessory(t);
        expect(t.component.products.length).toBe(1);
        expect(t.component.totalUSD).toBe(20);
        expect(t.component.totalARS).toBe(30000);
        expect(t.component.balanceUSD).toBe(20);
        expect(t.component.form.controls.accesory.value).toBeNull();
        t.component.removeProduct(0);
        expect(t.component.totalUSD).toBe(0);
    });
    it.each([0, -1, 1.5])('rejects invalid quantity %s', async (quantity) => {
        const t = await newSale();
        await addAccessory(t, quantity);
        expect(t.component.products.length).toBe(0);
        expect(t.messages.error).toHaveBeenCalledOnce();
    });
    it('does not add an accessory twice', async () => {
        const t = await newSale();
        await addAccessory(t);
        await addAccessory(t);
        expect(t.component.products.length).toBe(1);
        expect(t.messages.error).toHaveBeenCalledWith(
            'El producto ya fue agregado',
        );
    });
    it('recalculates the pending ARS price when the manual dollar rate changes', async () => {
        const t = await newSale();
        t.component.form.controls.priceUSD.setValue(10);
        t.component.form.controls.exchangeRate.setValue(2000);
        expect(t.component.form.controls.priceARS.value).toBe(20000);
    });
    it('requires a customer and items before submitting', async () => {
        const t = await newSale();
        t.component.form.controls.client.setValue(null);
        await t.component.saveOrder();
        t.http.expectNone('/api/orders');
        expect(t.messages.error).toHaveBeenCalledWith(
            'Debe seleccionar un cliente',
        );
        t.component.form.controls.client.setValue(customer as Client);
        await t.component.saveOrder();
        expect(t.messages.error).toHaveBeenCalledWith(
            'Debe agregar al menos un producto',
        );
    });
    it('creates a fully paid order with products, payment, rate and delivery user', async () => {
        const t = await newSale();
        await addAccessory(t);
        t.component.payments.push({
            method: 'cash',
            currency: 'usd',
            amountUSD: 20,
            amountARS: 30000,
            exchangeRate: 1500,
            description: 'Caja Demo',
            cashAccountId: 1,
        });
        t.messages.question.mockResolvedValue(true);
        await t.component.saveOrder();
        await t.component.saveOrder();
        const request = t.http.expectOne('/api/orders');
        expect(request.request.body).toEqual(
            expect.objectContaining({
                clientId: 1,
                exchangeRate: 1500,
                type: 'sale',
                credit: false,
                deliveredByUserId: 1,
                products: [
                    {
                        productId: 1,
                        quantity: 2,
                        priceUSD: 10,
                        priceARS: 15000,
                        exchangeRate: 1500,
                    },
                ],
                payments: [
                    expect.objectContaining({
                        cashAccountId: 1,
                        amountUSD: 20,
                    }),
                ],
            }),
        );
        request.flush(order);
        expect(t.component.router.navigate).toHaveBeenCalledWith([
            '/orders/order',
            'order-1',
        ]);
    });
    it('credit confirmation excludes draft payments from the created order', async () => {
        const t = await newSale();
        await addAccessory(t);
        t.component.payments.push({
            method: 'cash',
            currency: 'usd',
            amountUSD: 5,
            amountARS: 7500,
            exchangeRate: 1500,
            description: 'Caja Demo',
            cashAccountId: 1,
        });
        t.messages.question.mockResolvedValue(true);
        await t.component.saveCredit();
        const request = t.http.expectOne('/api/orders');
        expect(request.request.body.credit).toBe(true);
        expect(request.request.body.payments).toEqual([]);
        request.flush(order);
    });
    it('cancelled confirmation leaves the sale editable', async () => {
        const t = await newSale();
        await addAccessory(t);
        await t.component.saveOrder();
        t.http.expectNone('/api/orders');
        expect(t.component.loading()).toBe(false);
        expect(t.component.products.length).toBe(1);
    });
    it('preserves items and unlocks retry after a server rejection', async () => {
        const t = await newSale();
        await addAccessory(t);
        t.messages.question.mockResolvedValue(true);
        await t.component.saveOrder();
        t.http
            .expectOne('/api/orders')
            .flush({}, { status: 409, statusText: 'Conflict' });
        expect(t.messages.showPublicError).toHaveBeenCalledOnce();
        expect(t.component.products.length).toBe(1);
        expect(t.component.loading()).toBe(false);
        expect(t.component.router.navigate).not.toHaveBeenCalled();
    });
    it('confirmed orders are read-only and cannot be posted again', async () => {
        const t = await newSale();
        t.component.loadOrder(order as unknown as OrderAndDetails);
        expect(t.component.form.disabled).toBe(true);
        await t.component.saveOrder();
        t.http.expectNone('/api/orders/continue/order-1');
    });
    it.each(['confirmed', 'cancelled'] as const)(
        'renders %s orders as a summary with no mutation controls',
        async (status) => {
            const t = await newSale();
            t.component.loadOrder({
                ...order,
                status,
            } as unknown as OrderAndDetails);
            t.fixture.changeDetectorRef.markForCheck();
            await t.fixture.whenStable();
            const text = t.fixture.nativeElement.textContent;
            expect(text).toContain('Solo lectura');
            expect(text).not.toContain('Nuevo Pago');
            expect(text).not.toContain('Eliminar');
            expect(text).not.toContain('Guardar');
            expect(t.fixture.nativeElement.querySelector('input')).toBeNull();
            expect(
                Object.values(t.component.form.controls).every(
                    (control) => control.disabled,
                ),
            ).toBe(true);
            const count = t.component.products.length;
            const payments = t.component.payments.length;
            t.component.removeProduct(0);
            t.component.paymentGridAction({
                event: 'delete',
                row: t.component.payments.array[0],
                index: 0,
            });
            t.component.rounding();
            t.component.newPayment();
            expect(t.component.products.length).toBe(count);
            expect(t.component.payments.length).toBe(payments);
        },
    );
    it('continues a pending order without resending persisted items or payments', async () => {
        const t = await newSale();
        t.component.loadOrder({
            ...order,
            status: 'pending',
        } as unknown as OrderAndDetails);
        t.http.expectOne('/api/clients/customer-1').flush(customer);
        t.messages.question.mockResolvedValue(true);
        await t.component.saveOrder();
        const request = t.http.expectOne('/api/orders/continue/order-1');
        expect(request.request.body.products).toEqual([]);
        expect(request.request.body.payments).toEqual([]);
        expect(request.request.body.clientId).toBeUndefined();
        expect(request.request.body.exchangeRate).toBeUndefined();
        request.flush(order);
    });
    it('adds rounding only for a small outstanding balance', async () => {
        const t = await newSale();
        await addAccessory(t);
        t.component.payments.push({
            method: 'cash',
            currency: 'usd',
            amountUSD: 19,
            amountARS: 28500,
            exchangeRate: 1500,
            description: 'Pago',
            cashAccountId: 1,
        });
        expect(t.component.enableRounding).toBe(true);
        t.component.rounding();
        expect(t.component.balanceUSD).toBe(0);
        expect(t.component.payments.array.at(-1)).toEqual(
            expect.objectContaining({
                description: 'Redondeo',
                cashAccountId: 1,
                amountUSD: 1,
                amountARS: 1500,
            }),
        );
    });
    it('retains the retail client if wholesale conversion is cancelled', async () => {
        const t = await newSale();
        t.component.form.controls.type.setValue('wholesale');
        await t.fixture.whenStable();
        expect(t.component.form.controls.type.value).toBe('sale');
        expect(t.component.form.controls.client.value.name).toBe('Ana Demo');
    });
    it('paginates sales and ignores an obsolete response', async () => {
        const t = dialogTest(OrdersComponent);
        await t.render();
        t.component.findOrders();
        const old = t.http.expectOne('/api/orders?page=1&limit=10');
        t.component.paginator.page = 2;
        t.component.findOrders();
        const next = t.http.expectOne('/api/orders?page=2&limit=10');
        next.flush({ ...page([order]), page: 2, totalPages: 2 });
        old.flush(page([]));
        expect(t.component.orders).toHaveLength(1);
        expect(t.component.paginator.page).toBe(2);
    });
    it('shows sales load errors and recovers on retry', async () => {
        const t = dialogTest(OrdersComponent);
        await t.render();
        t.component.findOrders();
        t.http
            .expectOne('/api/orders?page=1&limit=10')
            .flush({}, { status: 503, statusText: 'Unavailable' });
        await t.fixture.whenStable();
        expect(t.component.failed()).toBe(true);
        t.component.findOrders();
        t.http.expectOne('/api/orders?page=1&limit=10').flush(page([order]));
        await t.fixture.whenStable();
        expect(t.component.failed()).toBe(false);
        expect(t.fixture.nativeElement.textContent).toContain('Ana Demo');
    });
    it('only cancels an order after confirmation and reloads the sales list', async () => {
        const t = dialogTest(OrdersComponent);
        await t.render();
        await t.component.cancelOrder(order as unknown as OrderAndDetails);
        t.http.expectNone('/api/orders/cancel/order-1');
        t.messages.question.mockResolvedValue(true);
        await t.component.cancelOrder(order as unknown as OrderAndDetails);
        t.http.expectOne('/api/orders/cancel/order-1').flush(order);
        t.http.expectOne('/api/orders?page=1&limit=10').flush(page([]));
        expect(t.messages.success).toHaveBeenCalledOnce();
    });
});
