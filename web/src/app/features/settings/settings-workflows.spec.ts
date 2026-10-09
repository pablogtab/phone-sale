import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { dialogTest } from '@/testing/dialog-test-bed';
import { model } from '@/testing/screen-fixtures';
import { DeviceColor } from '@/app/core/models/device-color';
import { DeviceStorageSize } from '@/app/core/models/device-storage-size';
import { ModelAdjustment } from '@/app/core/models/model-adjustment';
import { PricesSettingsComponent } from './prices-settings/prices-settings.component';
import { ModelAdjustmentComponent } from './model-adjustment/model-adjustment.component';
import { DeviceColorSettingsComponent } from './device-color-settings/device-color-settings.component';
import { DeviceStorageSizeSettingsComponent } from './device-storage-size-settings/device-storage-size-settings.component';
const adjustment = {
    modelId: 1,
    type: 'depreciation',
    description: 'battery',
    rangeStart: 0,
    rangeEnd: 80,
    factor: -20,
} as ModelAdjustment;
describe('catalog settings workflows', () => {
    afterEach(() => {
        try {
            TestBed.inject(HttpTestingController).verify();
        } finally {
            TestBed.resetTestingModule();
        }
    });
    it('keeps separate new and used reference prices for each capacity', async () => {
        const t = dialogTest(PricesSettingsComponent);
        await t.render();
        expect(t.component.models.array[0].sellingPrice).toBe(150);
        expect(t.component.usedModels.array[0].isUsed).toBe(true);
        expect(t.component.usedModels.array[0].sellingPrice).toBe(0);
    });
    it('saves prices for both conditions after confirmation and reloads', async () => {
        const t = dialogTest(PricesSettingsComponent);
        await t.render();
        t.component.edit();
        t.component.usedModels.array[0].sellingPrice = 90;
        t.messages.question.mockResolvedValue(true);
        await t.component.save();
        const request = t.http.expectOne('/api/devices/price-reference/');
        expect(request.request.body.data).toEqual([
            expect.objectContaining({
                modelId: 1,
                storageSizeId: 1,
                sellingPrice: 150,
                isUsed: false,
            }),
            expect.objectContaining({
                modelId: 1,
                storageSizeId: 1,
                sellingPrice: 90,
                isUsed: true,
            }),
        ]);
        request.flush(null);
        await t.render();
        expect(t.messages.success).toHaveBeenCalledOnce();
    });
    it('rejects negative reference prices without writes', async () => {
        const t = dialogTest(PricesSettingsComponent);
        await t.render();
        t.component.models.array[0].sellingPrice = -1;
        await t.component.save();
        expect(t.messages.error).toHaveBeenCalledOnce();
        t.http.expectNone('/api/devices/price-reference/');
    });
    it('cancelling reference price edits restores stored values', async () => {
        const t = dialogTest(PricesSettingsComponent);
        await t.render();
        t.component.edit();
        t.component.models.array[0].sellingPrice = 999;
        t.component.cancel();
        await t.render();
        expect(t.component.models.array[0].sellingPrice).toBe(150);
        expect(t.component.isEditing).toBe(false);
    });
    it('adds a model adjustment draft with its model ID', async () => {
        const t = dialogTest(ModelAdjustmentComponent);
        await t.render();
        t.component.addRow(
            t.component.deviceModelWithAdjustmentsSubject.value[0],
        );
        expect(
            t.component.deviceModelWithAdjustmentsSubject.value[0]
                .modelAdjustments[0].modelId,
        ).toBe(1);
    });
    it.each([
        { ...adjustment, type: null },
        { ...adjustment, description: null },
        { ...adjustment, rangeStart: null },
        { ...adjustment, rangeStart: 90 },
        { ...adjustment, factor: 0 },
    ])(
        'rejects incomplete or inverted model adjustment %#',
        async (invalid) => {
            const t = dialogTest(ModelAdjustmentComponent);
            await t.render();
            t.component.onRowEditSave(invalid);
            await t.render();
            expect(t.messages.warning).toHaveBeenCalledOnce();
            t.http.expectNone('/api/model-adjustment', 'POST');
        },
    );
    it('accepts a range starting at zero and persists a new adjustment', async () => {
        const t = dialogTest(ModelAdjustmentComponent);
        await t.render();
        t.component.onRowEditSave(adjustment);
        const request = t.http.expectOne('/api/model-adjustment');
        expect(request.request.method).toBe('POST');
        expect(request.request.body.rangeStart).toBe(0);
        request.flush(adjustment);
        await t.render();
        expect(t.messages.success).toHaveBeenCalledOnce();
    });
    it('updates and deletes adjustments only after confirmation', async () => {
        const t = dialogTest(ModelAdjustmentComponent);
        await t.render();
        t.component.onRowEditSave({ ...adjustment, id: 1 });
        t.http.expectOne('/api/model-adjustment/1').flush(adjustment);
        await t.render();
        await t.component.deleteRow({ ...adjustment, id: 1 });
        t.http.expectNone('/api/model-adjustment/1');
        t.messages.question.mockResolvedValue(true);
        await t.component.deleteRow({ ...adjustment, id: 1 });
        const request = t.http.expectOne('/api/model-adjustment/1');
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
        await t.render();
    });
    for (const [name, ComponentType, url, item] of [
        [
            'color',
            DeviceColorSettingsComponent,
            '/api/devices/color',
            model.availableColors[0],
        ],
        [
            'storage',
            DeviceStorageSizeSettingsComponent,
            '/api/devices/storage-size',
            model.availableStorageSizes[0],
        ],
    ] as const) {
        it(`creates ${name} labels through the generic dialog and reloads`, async () => {
            const t = dialogTest(
                ComponentType as typeof DeviceColorSettingsComponent,
                { title: 'Catálogo' },
            );
            await t.render();
            const closed = new Subject();
            vi.spyOn(
                t.fixture.debugElement.injector.get(Dialog),
                'open',
            ).mockReturnValue({ closed } as never);
            t.component.openNew();
            closed.next(item);
            const request = t.http.expectOne(url);
            expect(request.request.method).toBe('POST');
            request.flush(item);
            await t.render();
            expect(t.messages.success).toHaveBeenCalledOnce();
        });
        it(`cancels ${name} activation without a write`, async () => {
            const t = dialogTest(
                ComponentType as typeof DeviceColorSettingsComponent,
                { title: 'Catálogo' },
            );
            await t.render();
            await t.component.toggleActive(false, item as DeviceColor);
            expect(t.component.toggleControls[1].value).toBe(true);
            t.http.expectNone(url + '/1');
        });
        it(`persists ${name} activation after confirmation`, async () => {
            const t = dialogTest(
                ComponentType as typeof DeviceColorSettingsComponent,
                { title: 'Catálogo' },
            );
            await t.render();
            t.messages.question.mockResolvedValue(true);
            await t.component.toggleActive(false, item as DeviceColor);
            const request = t.http.expectOne(url + '/1');
            expect(request.request.body).toEqual({ active: false });
            request.flush(item);
        });
    }
});
