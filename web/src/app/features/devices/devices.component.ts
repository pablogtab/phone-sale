import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageStateComponent } from '../../shared/ui/page-state/page-state';
import { SharedModule } from '@/app/shared/ui/shared.module';
import {
    Device,
    DEVICE_STATUSES,
    DEVICE_STATUSES_TRANSLATION,
    DeviceStatusTranslation,
} from '@/app/core/models/device';
import { DeviceModel } from '@/app/core/models/device-model';
import { DeviceModelService } from '@/app/core/api/device-model.service';
import { DeviceService } from '@/app/core/api/device.service';
import { environment } from '@/environments';
import { Dialog } from '@angular/cdk/dialog';
import {
    Component,
    DestroyRef,
    inject,
    signal,
    ViewChild,
} from '@angular/core';

import {
    EditDeviceComponent,
    EditDeviceDialogParams,
} from './edit-device/edit-device.component';
import { SearchTermComponent } from '@/app/shared/ui/search-term/search-term.component';
import {
    DeviceInfoComponent,
    DeviceInfoParams,
} from './device-info/device-info.component';
import { ServiceComponent } from './service/service.component';
import { ServiceDetailComponent } from './service-detail/service-detail.component';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { FormControl, FormGroup } from '@angular/forms';
import { MessagesService } from '@/app/core/api/messages.service';

@Component({
    selector: 'app-devices',
    imports: [SharedModule, MultiSelectModule, PageStateComponent],
    templateUrl: './devices.component.html',
    styleUrl: './devices.component.css',
})
export class DevicesComponent {
    @ViewChild(SearchTermComponent) search: SearchTermComponent;
    private messages = inject(MessagesService);
    private dialog = inject(Dialog);
    private deviceService = inject(DeviceService);
    private deviceModelService = inject(DeviceModelService);
    DEVICE_STATUSES = DEVICE_STATUSES;
    models: (DeviceModel & { devices: DeviceAndFile[] })[] = [];
    statuses: string[] = ['available', 'reserved', 'repairing', 'transit'];

    private readonly destroyRef = inject(DestroyRef);
    readonly loading = signal(true);
    readonly failed = signal(false);
    private lastQuery = '';
    private requestId = 0;
    get totalDevices() {
        return this.models.reduce(
            (total, model) => total + model.devices.length,
            0,
        );
    }
    constructor() {}

    baseFilesUrl: string = environment.filesUrl;

    filters = new FormGroup({
        status: new FormControl<string[]>([
            'available',
            'reserved',
            'repairing',
            'transit',
        ]),
    });

    ngAfterViewInit(): void {
        this.loadModels();
        this.search.onSearch
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((query) => this.loadDevices(query));
        this.filters.controls.status.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.loadDevices());
    }

    loadModels() {
        this.loading.set(true);
        this.failed.set(false);
        this.deviceModelService
            .getAll()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (models) => {
                    this.models = models
                        .map((model) => ({
                            ...model,
                            devices: [] as DeviceAndFile[],
                        }))
                        .sort((a, b) => b.index - a.index);
                    this.loadDevices();
                },
                error: () => {
                    this.failed.set(true);
                    this.loading.set(false);
                },
            });
    }

    loadDevices(query = this.lastQuery) {
        this.lastQuery = query;
        const requestId = ++this.requestId;
        this.loading.set(true);
        this.failed.set(false);
        this.deviceService
            .getFiltered({
                query,
                status: this.filters.controls.status
                    .value as DeviceStatusTranslation[],
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (devices) => {
                    if (requestId !== this.requestId) return;
                    this.models.forEach(
                        (model) =>
                            (model.devices = devices.filter(
                                (device) => device.modelId === model.id,
                            )),
                    );
                    this.loading.set(false);
                },
                error: () => {
                    if (requestId === this.requestId) {
                        this.failed.set(true);
                        this.loading.set(false);
                    }
                },
            });
    }

    newDevice() {
        const data: EditDeviceDialogParams = {
            title: 'Nuevo Equipo',
        };
        this.dialog.open(EditDeviceComponent, { data }).closed.subscribe(() => {
            this.loadDevices();
        });
    }

    deviceDetail(deviceId: number) {
        this.dialog
            .open<any, DeviceInfoParams>(DeviceInfoComponent, {
                data: { deviceId },
            })
            .closed.subscribe(() => {
                this.loadDevices();
            });
    }

    editDevice(device: Device) {
        const data: EditDeviceDialogParams = {
            title: 'Editar Equipo',
            deviceId: device.id,
        };
        this.dialog.open(EditDeviceComponent, { data }).closed.subscribe(() => {
            this.loadDevices();
        });
    }

    createService(device: Device) {
        const data: { deviceId: number } = {
            deviceId: device.id,
        };
        this.dialog.open(ServiceComponent, { data }).closed.subscribe(() => {
            this.loadDevices();
        });
    }

    createServiceDetail(device: Device) {
        const data: { deviceId: number } = {
            deviceId: device.id,
        };
        this.dialog
            .open(ServiceDetailComponent, { data })
            .closed.subscribe(() => {
                this.loadDevices();
            });
    }

    getDeviceStatus(status: string | string[]): string {
        if (Array.isArray(status)) {
            return status
                .map(
                    (s) =>
                        DEVICE_STATUSES_TRANSLATION[
                            s as keyof typeof DEVICE_STATUSES_TRANSLATION
                        ] ?? 'Desconocido',
                )
                .join(', ');
        }

        return (
            DEVICE_STATUSES_TRANSLATION[
                status as keyof typeof DEVICE_STATUSES_TRANSLATION
            ] ?? 'Desconocido'
        );
    }

    async setAsAvailable(device: Device) {
        const rta = await this.messages.question(
            '¿Está seguro que desea marcar este equipo como disponible?',
        );
        if (!rta) return;

        this.deviceService.setAsAvailable(device.id).subscribe(
            () => {
                this.loadDevices();
            },
            (err) => {
                this.messages.showPublicError(err);
            },
        );
    }
}

type DeviceAndFile = Device & { mainPhotoUrl?: string };
