import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { DetailedDevice, DeviceService } from '@/app/core/api/device.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { collapsableOpen } from '@/app/core/utils/animations/collapsable-open.animation';
import { environment } from '@/environments';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

import { SharedModule } from '../../../shared/ui/shared.module';
import {
    DeviceTestProcessComponent,
    DeviceTestProcessParams,
} from '../device-test-process/device-test-process.component';
import {
    EditDeviceComponent,
    EditDeviceDialogParams,
} from '../edit-device/edit-device.component';
import { Device, DEVICE_STATUSES } from '@/app/core/models/device';
import { TimelineModule } from '@openng/optimus-ui/timeline';

@Component({
    imports: [SharedModule, TimelineModule],
    animations: [collapsableOpen],
    templateUrl: './device-info.component.html',
    styleUrl: './device-info.component.css',
})
export class DeviceInfoComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    private deviceService = inject(DeviceService);
    private messages = inject(MessagesService);
    private dialog = inject(Dialog);
    private dialogRef = inject(DialogRef);
    baseFilesUrl: string = environment.filesUrl;
    data: DeviceInfoParams = inject(DIALOG_DATA);

    device: DetailedDevice = {} as DetailedDevice;

    constructor() {}

    ngOnInit(): void {
        this.loadInfo();
    }

    loadInfo() {
        this.deviceService
            .get(this.data.deviceId)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((device) => {
                this.device = device;
                // this.editDevice()
            });
    }

    testDevice() {
        this.dialog
            .open<boolean, DeviceTestProcessParams>(
                DeviceTestProcessComponent,
                { data: { deviceId: this.device.id } },
            )
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe((tested) => {
                if (!tested) return;
                this.messages.success('Dispositivo marcado como TESTEADO');
                this.loadInfo();
            });
    }

    editDevice() {
        this.dialog
            .open<boolean, EditDeviceDialogParams>(EditDeviceComponent, {
                data: {
                    deviceId: this.device.id,
                    title: 'Editar equipo',
                },
            })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe((edited) => {
                if (!edited) return;
                this.messages.success('Dispositivo actualizado');
                this.loadInfo();
            });
    }

    async undoTest() {
        const confirm = await this.messages.question(
            '¿Desea marcar el dispositivo como SIN TESTEAR?',
        );
        if (!confirm) return;

        this.deviceService
            .undoTestDevice(this.device.id)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.messages.warning('Marcado como SIN TESTEAR');
                this.loadInfo();
            });
    }

    getDeviceStatus(device: Device): string {
        return DEVICE_STATUSES[device.status] ?? 'Desconocido';
    }

    get hasBeenTested() {
        return Boolean(this.device?.testedAt);
    }

    get status() {
        return 'DISPONIBLE';
    }

    get isSealed() {
        return this.device.condition === 'sealed';
    }

    get batteryInfo() {
        let state = '';
        if (this.device?.batteryHealth) {
            state += 'BAT: ' + this.device.batteryHealth + '%';
        }
        if (this.device?.batteryCicleCount) {
            state += `${(state.length && ', ') || ''}CICLOS: ${this.device.batteryCicleCount}`;
        }
        return state;
    }

    get condition() {
        switch (this.device.condition) {
            case 'sealed':
                return 'Sellado';
            case 'openBox':
                return 'Caja Abierta';
            case 'used':
                return 'Usado';
            default:
                return '';
        }
    }
}

export type DeviceInfoParams = {
    deviceId: number;
};
