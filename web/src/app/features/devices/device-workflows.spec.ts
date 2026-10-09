import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { dialogTest } from '@/testing/dialog-test-bed';
import { model, device } from '@/testing/screen-fixtures';
import { EditDeviceComponent } from './edit-device/edit-device.component';
import { DeviceInfoComponent } from './device-info/device-info.component';
import { DeviceTestProcessComponent } from './device-test-process/device-test-process.component';
import { DevicesComponent } from './devices.component';
import { ServiceComponent } from './service/service.component';
import { ServiceDetailComponent } from './service-detail/service-detail.component';
async function newDevice() {
    const t = dialogTest(EditDeviceComponent, { title: 'Nuevo equipo' });
    await t.render();
    t.component.form.controls.model.setValue(model);
    t.http.expectOne('/api/devices/models/1').flush(model);
    await t.fixture.whenStable();
    t.component.form.patchValue({ colorId: 1, storageSizeId: 1, sealed: true });
    return t;
}
describe('inventory workflows', () => {
    afterEach(() => {
        try {
            TestBed.inject(HttpTestingController).verify();
        } finally {
            TestBed.resetTestingModule();
        }
    });
    it('selects a model and fetches compatible colors and capacities', async () => {
        const t = await newDevice();
        expect(t.component.availableColors[0].name).toBe('Gold');
        t.component.form.controls.model.setValue(null);
        expect(t.component.availableColors).toEqual([]);
        expect(t.component.form.controls.colorId.value).toBeNull();
        expect(t.component.form.controls.storageSizeId.value).toBeNull();
    });
    it.each([
        ['imei', '123'],
        ['batteryHealth', 101],
        ['batteryCicleCount', -1],
        ['warrantyExpiresAt', '15/26'],
    ] as const)('rejects invalid %s before writing', async (field, value) => {
        const t = await newDevice();
        t.component.form.get(field).setValue(value);
        await t.component.save();
        expect(t.messages.error).toHaveBeenCalledOnce();
        t.http.expectNone('/api/devices/devices/');
    });
    it('creates a sealed device with multipart data after confirmation', async () => {
        const t = await newDevice();
        t.messages.question.mockResolvedValue(true);
        await t.component.save();
        const request = t.http.expectOne('/api/devices/devices/');
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toBeInstanceOf(FormData);
        const data = request.request.body as FormData;
        expect(data.get('modelId')).toBe('1');
        expect(data.get('condition')).toBe('sealed');
        expect(data.get('hasProblem')).toBe('false');
        request.flush(device);
        expect(t.ref.close).toHaveBeenCalledWith(device);
    });
    it('edits an existing device without failing for an absent IMEI', async () => {
        const t = dialogTest(EditDeviceComponent, {
            title: 'Editar equipo',
            deviceId: 1,
        });
        await t.render();
        t.component.form.controls.sealed.setValue(false);
        t.messages.question.mockResolvedValue(true);
        await t.component.save();
        const request = t.http.expectOne('/api/devices/devices/1');
        expect(request.request.method).toBe('PATCH');
        expect(request.request.body.get('condition')).toBe('used');
        request.flush(device);
        expect(t.ref.close).toHaveBeenCalledWith(device);
    });
    it('cancelling creation does not write or discard the selected model', async () => {
        const t = await newDevice();
        await t.component.save();
        t.http.expectNone('/api/devices/devices/');
        expect(t.component.form.controls.model.value.id).toBe(1);
    });
    it('clearing IMEI safely clears the secondary IMEI', async () => {
        const t = await newDevice();
        t.component.form.controls.imei2.setValue('123456789012345');
        t.component.form.controls.imei.setValue(null);
        expect(t.component.form.controls.imei2.value).toBeNull();
    });
    it('uploads the main picture along with the device values', async () => {
        const t = await newDevice();
        const file = new File(['demo'], 'demo.jpg', { type: 'image/jpeg' });
        t.component.uploadMainPhoto({ target: { files: [file] } });
        t.messages.question.mockResolvedValue(true);
        await t.component.save();
        const request = t.http.expectOne('/api/devices/devices/');
        expect(request.request.body.get('mainPhoto').name).toBe('demo.jpg');
        request.flush(device);
    });
    it('shows device condition, battery and testing status from fetched details', async () => {
        const t = dialogTest(DeviceInfoComponent, { deviceId: 1 });
        await t.render();
        expect(t.component.condition).toBe('Sellado');
        expect(t.component.hasBeenTested).toBe(false);
        t.component.device = {
            ...t.component.device,
            condition: 'used',
            batteryHealth: 85,
            batteryCicleCount: 100,
            testedAt: '2026-10-09',
        };
        expect(t.component.condition).toBe('Usado');
        expect(t.component.batteryInfo).toBe('BAT: 85%, CICLOS: 100');
        expect(t.component.hasBeenTested).toBe(true);
    });
    it('only undoes a device test after confirmation', async () => {
        const t = dialogTest(DeviceInfoComponent, { deviceId: 1 });
        await t.render();
        await t.component.undoTest();
        t.http.expectNone('/api/devices/devices/undo-test-device/1');
        t.messages.question.mockResolvedValue(true);
        await t.component.undoTest();
        t.http.expectOne('/api/devices/devices/undo-test-device/1').flush(null);
        await t.render();
        expect(t.messages.warning).toHaveBeenCalledOnce();
    });
    it('records the current tester identity and closes only after success', async () => {
        const t = dialogTest(DeviceTestProcessComponent, { deviceId: 1 });
        await t.render();
        t.component.save();
        const request = t.http.expectOne('/api/devices/devices/test-device');
        expect(request.request.body).toEqual({
            deviceId: 1,
            testerUserPublicId: 'user-1',
        });
        expect(t.ref.close).not.toHaveBeenCalled();
        request.flush(null);
        expect(t.ref.close).toHaveBeenCalledWith(true);
    });
    it('cancelled device testing returns false without a write', async () => {
        const t = dialogTest(DeviceTestProcessComponent, { deviceId: 1 });
        await t.render();
        t.component.cancel();
        expect(t.ref.close).toHaveBeenCalledWith(false);
    });
    it('keeps newer inventory search results when an old request finishes', async () => {
        const t = dialogTest(DevicesComponent);
        await t.render();
        t.component.loadDevices('old');
        const old = t.http.expectOne(
            (r) =>
                (r.url === '/api/devices/devices' &&
                    r.params.get('query') === 'old') ||
                r.url.includes('query=old'),
        );
        t.component.loadDevices('new');
        const current = t.http.expectOne((r) => r.url.includes('query=new'));
        current.flush([]);
        old.flush([device]);
        expect(t.component.totalDevices).toBe(0);
        expect(t.component.loading()).toBe(false);
    });
    it('shows an inventory request error and recovers on reload', async () => {
        const t = dialogTest(DevicesComponent);
        await t.render();
        t.component.loadDevices();
        t.http
            .expectOne((r) => r.url.startsWith('/api/devices/devices'))
            .flush({}, { status: 503, statusText: 'Unavailable' });
        expect(t.component.failed()).toBe(true);
        t.component.loadDevices();
        t.http
            .expectOne((r) => r.url.startsWith('/api/devices/devices'))
            .flush([device]);
        await t.fixture.whenStable();
        expect(t.component.failed()).toBe(false);
        expect(t.component.totalDevices).toBe(1);
    });
    it('requires provider, date and reason for technical service', async () => {
        const t = dialogTest(ServiceComponent, { deviceId: 1 });
        await t.render();
        t.component.save();
        t.http.expectOne('/api/devices/devices/1').flush(device);
        expect(t.messages.error).toHaveBeenCalledOnce();
        t.http.expectNone('/api/devices/devices/1/technicalService');
    });
    it('sends a device to the selected technical service provider', async () => {
        const t = dialogTest(ServiceComponent, { deviceId: 1 });
        await t.render();
        t.component.form.patchValue({
            providerId: 1,
            reason: 'Reparación',
            date: new Date('2026-10-09T12:00:00Z'),
        });
        t.component.save();
        t.http.expectOne('/api/devices/devices/1').flush(device);
        const request = t.http.expectOne(
            '/api/devices/devices/1/technicalService',
        );
        expect(request.request.body).toEqual({
            technicalServiceProviderId: 1,
            technicalServiceDescription: 'Reparación',
            technicalServiceDate: new Date('2026-10-09T12:00:00Z'),
        });
        request.flush(device);
        expect(t.ref.close).toHaveBeenCalledWith(device);
    });
    it('records service completion with a cost and description', async () => {
        const t = dialogTest(ServiceDetailComponent, { deviceId: 1 });
        await t.render();
        t.component.form.patchValue({
            bateryReplacement: true,
            serviceCost: 25,
            technicalServiceDescription: 'Batería reemplazada',
        });
        t.component.save();
        const request = t.http.expectOne(
            '/api/devices/devices/1/technicalService/detail',
        );
        expect(request.request.body.serviceCost).toBe(25);
        request.flush(device);
        expect(t.ref.close).toHaveBeenCalledWith(device);
    });
});
