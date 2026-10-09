import { catalogLabel } from '@/app/core/utils/catalog-label';
import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { SharedModule } from '@/app/shared/ui/shared.module';
import {
    DeviceModelAndRelations,
    DeviceModelService,
} from '@/app/core/api/device-model.service';
import {
    CdkDragDrop,
    DragDropModule,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, signal } from '@angular/core';

import { DeviceColorSettingsComponent } from '../device-color-settings/device-color-settings.component';
import { DeviceStorageSizeSettingsComponent } from '../device-storage-size-settings/device-storage-size-settings.component';
import { DeviceModelEditComponent } from './device-model-edit/device-model-edit.component';
import { Dialog } from '@angular/cdk/dialog';
import { MessagesService } from '@/app/core/api/messages.service';

@Component({
    selector: 'app-device-model-settings',
    imports: [SharedModule, DragDropModule],
    templateUrl: './device-model-settings.component.html',
    styleUrl: './device-model-settings.component.css',
})
export class DeviceModelSettingsComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    constructor(
        private readonly dialog: Dialog,
        private readonly messages: MessagesService,
        private readonly deviceModelService: DeviceModelService,
    ) {}

    readonly catalogLabel = catalogLabel;
    models: DeviceModelAndRelations[] = [];
    loading = signal(false);
    failed = signal(false);
    savingOrder = signal(false);
    private loadRequest = 0;

    ngAfterViewInit(): void {
        this.reloadData();
    }

    reloadData() {
        const request = ++this.loadRequest;
        this.loading.set(true);
        this.failed.set(false);
        this.deviceModelService
            .getAll()
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: (models) => {
                    if (request === this.loadRequest) {
                        this.models = models;
                        this.loading.set(false);
                    }
                },
                error: () => {
                    if (request === this.loadRequest) {
                        this.failed.set(true);
                        this.loading.set(false);
                    }
                },
            });
    }

    newDeviceModel() {
        this.dialog
            .open(DeviceModelEditComponent, { data: { title: 'Nuevo' } })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => this.reloadData());
    }

    openColorSettings() {
        this.dialog
            .open(DeviceColorSettingsComponent, { data: { title: 'Colores' } })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => this.reloadData());
    }

    editModel(model: DeviceModelAndRelations) {
        this.dialog
            .open(DeviceModelEditComponent, {
                data: { title: 'Editar', model },
            })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => this.reloadData());
    }

    openStorageSizeSettings() {
        this.dialog
            .open(DeviceStorageSizeSettingsComponent, {
                data: { title: 'Almacenamiento' },
            })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => this.reloadData());
    }

    parseColors(model: DeviceModelAndRelations) {
        return model.availableColors
            .map((c) => catalogLabel(c.name))
            .join(', ');
    }

    parseSizes(model: DeviceModelAndRelations) {
        return model.availableStorageSizes.map((s) => s.size).join(', ');
    }

    drop(event: CdkDragDrop<DeviceModelAndRelations[]>) {
        if (this.savingOrder() || event.previousIndex === event.currentIndex)
            return;
        const previous = [...this.models];
        moveItemInArray(this.models, event.previousIndex, event.currentIndex);
        this.savingOrder.set(true);
        this.deviceModelService
            .updateIndexes(
                this.models.map((model, index) => ({
                    id: model.id,
                    index: this.models.length - index,
                })),
            )
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: () => {
                    this.savingOrder.set(false);
                    this.reloadData();
                },
                error: () => {
                    this.models = previous;
                    this.savingOrder.set(false);
                    this.messages.error(
                        'No se pudo guardar el orden de los modelos',
                    );
                },
            });
    }
}
