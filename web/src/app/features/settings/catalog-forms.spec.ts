import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { dialogTest } from '@/testing/dialog-test-bed';
import { model, product } from '@/testing/screen-fixtures';
import { DeviceModelEditComponent } from './device-model-settings/device-model-edit/device-model-edit.component';
import { EditProductComponent } from './products/edit-product/edit-product.component';
describe('catalog editing workflows', () => {
    afterEach(() => {
        try {
            TestBed.inject(HttpTestingController).verify();
        } finally {
            TestBed.resetTestingModule();
        }
    });
    it('creates a model without requesting a null ID, trims labels and blocks duplicate saves', async () => {
        const t = dialogTest(DeviceModelEditComponent, { title: 'Nuevo' });
        await t.render();
        t.component.nameControl.setValue('  iPhone 8 Plus  ');
        t.component.toggleColor(1);
        t.component.toggleStorage(1);
        t.component.save();
        t.component.save();
        const request = t.http.expectOne('/api/devices/models/');
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({
            name: 'iPhone 8 Plus',
            colors: [1],
            storageSizes: [1],
            recommendedAccesories: [],
        });
        request.flush({});
        expect(t.ref.close).toHaveBeenCalledOnce();
    });
    it('updates an existing model using its selected colors and capacity', async () => {
        const t = dialogTest(DeviceModelEditComponent, {
            title: 'Editar',
            model,
        });
        await t.render();
        t.component.nameControl.setValue('iPhone 8 Plus');
        t.component.save();
        const request = t.http.expectOne('/api/devices/models/1');
        expect(request.request.method).toBe('PATCH');
        request.flush({});
        expect(t.ref.close).toHaveBeenCalledOnce();
    });
    it.each(['name', 'colors', 'sizes'])(
        'requires model %s before writing',
        async (missing) => {
            const t = dialogTest(DeviceModelEditComponent, { title: 'Nuevo' });
            await t.render();
            t.component.nameControl.setValue(
                missing === 'name' ? '   ' : 'iPhone 8',
            );
            if (missing !== 'colors') t.component.toggleColor(1);
            if (missing !== 'sizes') t.component.toggleStorage(1);
            t.component.save();
            t.http.expectNone('/api/devices/models/');
            expect(t.messages.error).toHaveBeenCalledOnce();
            expect(t.ref.close).not.toHaveBeenCalled();
        },
    );
    it('retains the model draft on server failure and permits retry', async () => {
        const t = dialogTest(DeviceModelEditComponent, {
            title: 'Editar',
            model,
        });
        await t.render();
        t.component.save();
        t.http
            .expectOne('/api/devices/models/1')
            .flush({}, { status: 500, statusText: 'Error' });
        expect(t.component.nameControl.value).toBe('iPhone 8');
        expect(t.component.saving).toBe(false);
        expect(t.messages.showPublicError).toHaveBeenCalledOnce();
        expect(t.ref.close).not.toHaveBeenCalled();
        t.component.save();
        t.http.expectOne('/api/devices/models/1').flush({});
    });
    it('does not delete a model when confirmation is cancelled', async () => {
        const t = dialogTest(DeviceModelEditComponent, {
            title: 'Editar',
            model,
        });
        await t.render();
        await t.component.delete();
        expect(t.messages.question).toHaveBeenCalledOnce();
        t.http.expectNone('/api/devices/models/1');
    });
    it('loads product values into the real form before editing', async () => {
        const t = dialogTest(EditProductComponent, {
            title: 'Editar',
            productId: 1,
        });
        await t.render();
        expect(
            t.fixture.nativeElement.querySelector(
                'input[formcontrolname="description"]',
            ).value,
        ).toBe('Cable Demo');
        t.messages.question.mockResolvedValue(true);
        t.component.form.controls.stock.setValue(12);
        await t.component.save();
        const request = t.http.expectOne('/api/products/1');
        expect(request.request.method).toBe('PUT');
        expect(request.request.body.stock).toBe(12);
        request.flush({});
        expect(t.ref.close).toHaveBeenCalledOnce();
    });
    it('creates an accessory without requesting an undefined ID', async () => {
        const t = dialogTest(EditProductComponent, { title: 'Nuevo' });
        await t.render();
        t.component.form.patchValue(product);
        t.messages.question.mockResolvedValue(true);
        await t.component.save();
        const request = t.http.expectOne('/api/products/');
        expect(request.request.method).toBe('POST');
        request.flush({});
        expect(t.ref.close).toHaveBeenCalledOnce();
    });
    it('rejects an empty product before confirmation', async () => {
        const t = dialogTest(EditProductComponent, { title: 'Nuevo' });
        await t.render();
        await t.component.save();
        expect(t.messages.error).toHaveBeenCalledOnce();
        expect(t.messages.question).not.toHaveBeenCalled();
    });
    it('keeps a product draft on failure', async () => {
        const t = dialogTest(EditProductComponent, {
            title: 'Editar',
            productId: 1,
        });
        await t.render();
        t.messages.question.mockResolvedValue(true);
        await t.component.save();
        t.http
            .expectOne('/api/products/1')
            .flush({}, { status: 400, statusText: 'Bad Request' });
        expect(t.messages.showPublicError).toHaveBeenCalledOnce();
        expect(t.component.form.value.description).toBe('Cable Demo');
        expect(t.ref.close).not.toHaveBeenCalled();
    });
    it('cancelling product confirmation leaves the draft without writes', async () => {
        const t = dialogTest(EditProductComponent, { title: 'Nuevo' });
        await t.render();
        t.component.form.patchValue(product);
        await t.component.save();
        t.http.expectNone('/api/products/');
        expect(t.ref.close).not.toHaveBeenCalled();
    });
});
