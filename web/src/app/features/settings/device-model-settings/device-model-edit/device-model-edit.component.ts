import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { DeviceColor } from '@/app/core/models/device-color';
import { DeviceStorageSize } from '@/app/core/models/device-storage-size';
import { Product } from '@/app/core/models/product';
import { DeviceColorService } from '@/app/core/api/device-color.service';
import {
    DeviceModelAndRelations,
    DeviceModelService,
} from '@/app/core/api/device-model.service';
import { DeviceStorageSizeService } from '@/app/core/api/device-storage-size.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { collapsableOpen } from '@/app/core/utils/animations/collapsable-open.animation';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
    CdkDragDrop,
    DragDropModule,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, Inject, QueryList, ViewChildren } from '@angular/core';
import { finalize } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { ChipModule } from '@openng/optimus-ui/chip';

import { ProductSearchComponent } from '../../../../shared/ui/searchers/product-search.component';

@Component({
    selector: 'app-device-model-edit',
    imports: [
        SharedModule,
        ChipModule,
        ButtonModule,
        ProductSearchComponent,
        DragDropModule,
    ],
    animations: [collapsableOpen],
    templateUrl: './device-model-edit.component.html',
    styleUrl: './device-model-edit.component.css',
})
export class DeviceModelEditComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    constructor(
        private readonly dialogRef: DialogRef,
        private readonly messages: MessagesService,
        private readonly deviceModelService: DeviceModelService,
        private readonly deviceColorService: DeviceColorService,
        private readonly deviceStorageSizeService: DeviceStorageSizeService,
        @Inject(DIALOG_DATA)
        public readonly data: { model: DeviceModelAndRelations; title: string },
    ) {}

    @ViewChildren(ProductSearchComponent)
    productComponent: QueryList<ProductSearchComponent>;

    saving = false;
    modelId: number = null;
    nameControl = new FormControl<string>('');

    availableColors: DeviceColor[] = [];
    availableStorageSizes: DeviceStorageSize[] = [];
    recommendedAccesories: Product[] = [];

    deviceColors: Set<number> = new Set();
    deviceStorageSizes: Set<number> = new Set();

    editingAccesories: boolean;

    ngOnInit(): void {
        this.deviceColorService
            .getAll()
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((colors) => (this.availableColors = colors));
        this.deviceStorageSizeService
            .getAll()
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((sizes) => {
                this.availableStorageSizes = sizes.sort(
                    (a, b) => b.index - a.index,
                );
            });

        if (this.data.model) {
            this.modelId = this.data.model.id;
            this.nameControl.setValue(this.data.model.name);
            this.deviceColors = new Set(
                this.data.model.availableColors.map((c) => c.id),
            );
            this.deviceStorageSizes = new Set(
                this.data.model.availableStorageSizes.map((s) => s.id),
            );
        }

        if (this.modelId)
            this.deviceModelService
                .get(this.modelId)
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe((model) => {
                    this.recommendedAccesories = model.recommendedAccesories;
                });
    }

    toggleColor(id: number) {
        if (this.deviceColors.has(id)) {
            this.deviceColors.delete(id);
        } else {
            this.deviceColors.add(id);
        }
    }

    toggleStorage(id: number) {
        if (this.deviceStorageSizes.has(id)) {
            this.deviceStorageSizes.delete(id);
        } else {
            this.deviceStorageSizes.add(id);
        }
    }

    validate() {
        if (!this.nameControl.value?.trim()) {
            return 'Debe ingresar un nombre';
        }

        if (this.deviceColors.size === 0) {
            return 'Debe seleccionar al menos un color';
        }

        if (this.deviceStorageSizes.size === 0) {
            return 'Debe seleccionar al menos un tamaño de almacenamiento';
        }

        return null;
    }

    cancel() {
        this.dialogRef.close();
    }

    save() {
        if (this.saving) return;
        const error = this.validate();

        if (error) {
            return this.messages.error(error);
        }

        const device = {
            name: this.nameControl.value.trim(),
            colors: Array.from(this.deviceColors),
            storageSizes: Array.from(this.deviceStorageSizes),
            recommendedAccesories: this.recommendedAccesories.map((p) => p.id),
        };

        this.saving = true;
        const request = this.modelId
            ? this.deviceModelService.update(this.modelId, device)
            : this.deviceModelService.create(device);
        request
            .pipe(
                finalize(() => (this.saving = false)),
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe({
                next: () => {
                    this.messages.success(
                        this.modelId ? 'Modelo actualizado' : 'Modelo creado',
                    );
                    this.dialogRef.close();
                },
                error: (error) =>
                    this.messages.showPublicError(
                        error,
                        'No se pudo guardar el modelo',
                    ),
            });
    }

    async delete() {
        const rta = await this.messages.question(
            '¿Está seguro de que desea eliminar este modelo?',
        );
        if (!rta) return;

        this.deviceModelService
            .delete(this.modelId)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.messages.success('Modelo eliminado');
                this.dialogRef.close();
            });
    }

    addAccesory(product: Product) {
        if (!product) return;
        if (this.recommendedAccesories.find((p) => p.id === product.id)) return;
        this.recommendedAccesories = [...this.recommendedAccesories, product];
        this.productComponent.first.searcher.hcd.control.setValue(null);
    }

    removeAccesory(product: Product) {
        this.recommendedAccesories = this.recommendedAccesories.filter(
            (p) => p.id !== product.id,
        );
    }

    drop(event: CdkDragDrop<Product[]>) {
        moveItemInArray(
            this.recommendedAccesories,
            event.previousIndex,
            event.currentIndex,
        );
    }
}
