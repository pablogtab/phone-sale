import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import {
    EditObjectComponent,
    EditObjectData,
} from '@/app/shared/ui/edit-object/edit-object.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { DeviceStorageSize } from '@/app/core/models/device-storage-size';
import { DeviceStorageSizeService } from '@/app/core/api/device-storage-size.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { Dialog, DIALOG_DATA } from '@angular/cdk/dialog';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-device-storage-size-settings',
    imports: [SharedModule, DragDropModule],
    templateUrl: './device-storage-size-settings.component.html',
    styleUrl: './device-storage-size-settings.component.css',
})
export class DeviceStorageSizeSettingsComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    sizes: DeviceStorageSize[] = [];

    toggleControls: { [key: string]: FormControl } = {};

    title: string;
    data = inject(DIALOG_DATA);

    constructor(
        private dialog: Dialog,
        private messages: MessagesService,
        private deviceStorageSizeService: DeviceStorageSizeService,
    ) {}

    ngOnInit(): void {
        this.loadSizes();
    }

    drop(event: CdkDragDrop<DeviceStorageSize[]>) {
        const prevIndex = event.previousIndex;
        const currentIndex = event.currentIndex;

        const prev = this.sizes[prevIndex];
        const current = this.sizes[currentIndex];

        this.sizes[prevIndex] = current;
        this.sizes[currentIndex] = prev;

        this.sizes = this.sizes.map((size, index) => ({ ...size, index }));

        this.deviceStorageSizeService
            .updateIndexes(
                this.sizes.map((size) => ({
                    id: size.id,
                    index: this.sizes.length - size.index,
                })),
            )
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe();
    }

    openNew() {
        const data: EditObjectData<DeviceStorageSize> = {
            fields: [
                {
                    key: 'size',
                    label: 'Almacenamiento',
                    type: 'text',
                    required: true,
                },
            ],
            initialValues: {
                size: '',
            },
            title: 'Nuevo',
        };

        this.dialog
            .open<DeviceStorageSize>(EditObjectComponent, { data })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe((obj: DeviceStorageSize) => {
                if (!obj) return;

                this.deviceStorageSizeService
                    .create(obj)
                    .pipe(
                        refreshView(this.viewChangeDetector, this.viewLifetime),
                    )
                    .subscribe(() => {
                        this.loadSizes();
                        this.messages.success('Creado');
                    });
            });
    }

    openEdit(obj: DeviceStorageSize) {
        const data: EditObjectData<DeviceStorageSize> = {
            fields: [
                {
                    key: 'size',
                    label: 'Almacenamiento',
                    type: 'text',
                    required: true,
                },
            ],
            initialValues: obj,
            title: 'Editar',
        };

        this.dialog
            .open<DeviceStorageSize>(EditObjectComponent, { data })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe((ret: DeviceStorageSize) => {
                if (!ret) return;

                this.deviceStorageSizeService
                    .update(obj.id, ret)
                    .pipe(
                        refreshView(this.viewChangeDetector, this.viewLifetime),
                    )
                    .subscribe(() => {
                        this.loadSizes();
                    });
            });
    }

    loadSizes() {
        this.deviceStorageSizeService
            .getAll()
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((sizes) => {
                this.toggleControls = sizes.reduce(
                    (acc, size) => {
                        acc[size.id] = new FormControl(size.active);
                        return acc;
                    },
                    {} as { [key: string]: FormControl },
                );
                this.sizes = sizes.sort((a, b) => b.index - a.index);
            });
    }

    async deleteStorageSize(size: DeviceStorageSize) {
        const rta = await this.messages.question(`¿Estás seguro de eliminar?`);

        if (!rta) return;

        this.deviceStorageSizeService
            .delete(size.id)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.loadSizes();
                this.messages.success('Eliminado');
            });
    }

    async toggleActive(cond: boolean, size: DeviceStorageSize) {
        const rta = await this.messages.question(
            `¿Estás seguro de ${cond ? 'activar' : 'desactivar'}?`,
        );
        if (!rta) {
            this.toggleControls[size.id].setValue(!cond, { emitEvent: false });
            return;
        }
        this.deviceStorageSizeService
            .update(size.id, { active: cond })
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe();
    }
}
