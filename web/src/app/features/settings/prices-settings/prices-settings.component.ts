import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { GridDataSource } from '@/app/shared/ui/grid/grid.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { DeviceModel } from '@/app/core/models/device-model';
import { DevicePriceReference } from '@/app/core/models/device-price-reference';
import { DeviceStorageSize } from '@/app/core/models/device-storage-size';
import { DeviceModelService } from '@/app/core/api/device-model.service';
import {
    DevicePriceReferenceService,
    UpsertDeviceReference,
} from '@/app/core/api/device-price-reference.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { CdkTableModule } from '@angular/cdk/table';
import { Component, inject } from '@angular/core';

const MEMORY_SIZES = {
    TB: 1024,
    GB: 1,
};

@Component({
    selector: 'app-prices-settings',
    imports: [SharedModule, CdkTableModule],
    templateUrl: './prices-settings.component.html',
    styleUrl: './prices-settings.component.css',
})
export class PricesSettingsComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    devicePriceReferenceService = inject(DevicePriceReferenceService);
    deviceModelService = inject(DeviceModelService);
    columns: DeviceStorageSize[] = [];
    models = new GridDataSource<IRow>();
    usedModels = new GridDataSource<IRow>();
    messages = inject(MessagesService);

    isEditing = false;

    ngOnInit(): void {
        this.loadData();
    }

    get displayedColumns() {
        return [
            'model',
            'purchasePrice',
            'sellingPrice',
            'sellingPriceSale',
            'sellingPriceWholesale',
        ];
    }

    get columnNames() {
        return this.columns.map((c) => c.size);
    }

    edit() {
        this.isEditing = true;
    }

    async save() {
        const validated = this.validate();

        if (!validated) {
            this.messages.error('Los precios no pueden ser negativos');
            return;
        }

        const ans = await this.messages.question(
            'Está seguro de que desea guardar los cambios?',
        );
        if (!ans) return;

        const priceReferences: UpsertDeviceReference[] = [];

        this.models.array.forEach((row) => {
            priceReferences.push({
                modelId: row.modelId,
                storageSizeId: row.storageSizeId,
                purchasePrice: row.purchasePrice,
                sellingPrice: row.sellingPrice,
                sellingPriceSale: row.sellingPriceSale,
                sellingPriceWholesale: row.sellingPriceWholesale,
                isUsed: false,
            });
        });

        this.usedModels.array.forEach((row) => {
            priceReferences.push({
                modelId: row.modelId,
                storageSizeId: row.storageSizeId,
                purchasePrice: row.purchasePrice,
                sellingPrice: row.sellingPrice,
                sellingPriceSale: row.sellingPriceSale,
                sellingPriceWholesale: row.sellingPriceWholesale,
                isUsed: true,
            });
        });

        this.devicePriceReferenceService
            .upsert(priceReferences)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: () => {
                    this.messages.success('Precios actualizados correctamente');
                    this.loadData();
                },
                error: (err) => this.messages.showPublicError(err),
            });

        this.isEditing = false;
    }

    cancel() {
        this.isEditing = false;
        this.loadData();
    }

    validate() {
        let isValid = true;

        this.models.array.concat(this.usedModels.array).forEach((row) => {
            if (
                row.purchasePrice < 0 ||
                row.sellingPrice < 0 ||
                row.sellingPriceSale < 0 ||
                row.sellingPriceWholesale < 0
            ) {
                isValid = false;
            }
        });

        return isValid;
    }

    loadData() {
        this.deviceModelService
            .getAll({ includePriceReferences: true })
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((data) => {
                const models: IRow[] = [];
                const usedModels: IRow[] = [];

                data.forEach((model) => {
                    model.availableStorageSizes.forEach((size) => {
                        const matchingPriceReferences =
                            model.priceReferences.filter(
                                (pr) => pr.storageSizeId === size.id,
                            );

                        if (matchingPriceReferences.length > 0) {
                            // Procesar referencias de precios
                            matchingPriceReferences.forEach(
                                (priceReference) => {
                                    const entry: IRow = {
                                        model,
                                        size,
                                        id: priceReference.id,
                                        modelId: model.id,
                                        storageSizeId: size.id,
                                        purchasePrice:
                                            priceReference.purchasePrice ?? 0,
                                        sellingPrice:
                                            priceReference.sellingPrice ?? 0,
                                        sellingPriceSale:
                                            priceReference.sellingPriceSale ??
                                            0,
                                        sellingPriceWholesale:
                                            priceReference.sellingPriceWholesale ??
                                            0,
                                        isUsed: priceReference.isUsed,
                                    };

                                    // Si es un modelo usado (isUsed = true)
                                    if (priceReference.isUsed) {
                                        // Verificar si ya existe en usedModels
                                        const existingUsedModelIndex =
                                            usedModels.findIndex(
                                                (um) =>
                                                    um.modelId === model.id &&
                                                    um.storageSizeId ===
                                                        size.id,
                                            );

                                        if (existingUsedModelIndex >= 0) {
                                            // Si existe, actualizamos el modelo existente con los valores más recientes
                                            usedModels[existingUsedModelIndex] =
                                                {
                                                    ...usedModels[
                                                        existingUsedModelIndex
                                                    ],
                                                    purchasePrice:
                                                        entry.purchasePrice,
                                                    sellingPrice:
                                                        entry.sellingPrice,
                                                    sellingPriceSale:
                                                        entry.sellingPriceSale,
                                                    sellingPriceWholesale:
                                                        entry.sellingPriceWholesale,
                                                };
                                        } else {
                                            // Si no existe, agregamos el nuevo modelo
                                            usedModels.push(entry);
                                        }
                                    } else {
                                        // Agregar a models si no es usado
                                        models.push(entry);

                                        // También agregar a usedModels con isUsed: true si no existe
                                        const existingUsedModelIndex =
                                            usedModels.findIndex(
                                                (um) =>
                                                    um.modelId === model.id &&
                                                    um.storageSizeId ===
                                                        size.id,
                                            );

                                        if (existingUsedModelIndex === -1) {
                                            // Solo agregamos a usedModels si no existe
                                            usedModels.push({
                                                ...entry,
                                                id: null,
                                                purchasePrice: 0,
                                                sellingPrice: 0,
                                                sellingPriceSale: 0,
                                                sellingPriceWholesale: 0,
                                                isUsed: true, // Seteamos isUsed = true
                                            });
                                        }
                                    }
                                },
                            );
                        } else {
                            // Si no hay referencias de precios, agregamos con valores predeterminados
                            const defaultEntry: IRow = {
                                model,
                                size,
                                id: null,
                                modelId: model.id,
                                storageSizeId: size.id,
                                purchasePrice: 0,
                                sellingPrice: 0,
                                sellingPriceSale: 0,
                                sellingPriceWholesale: 0,
                                isUsed: false, // Default para models
                            };

                            models.push(defaultEntry);

                            // Agregar también a usedModels con isUsed: true si no existe
                            const existingUsedModelIndex = usedModels.findIndex(
                                (um) =>
                                    um.modelId === model.id &&
                                    um.storageSizeId === size.id,
                            );

                            if (existingUsedModelIndex === -1) {
                                usedModels.push({
                                    ...defaultEntry,
                                    isUsed: true,
                                });
                            }
                        }
                    });
                });

                this.models.array = models; // Modelos sin usar
                this.usedModels.array = usedModels; // Modelos usados
            });
    }
}

interface IRow extends Omit<
    DevicePriceReference,
    'createdAt' | 'updatedAt' | 'deletedAt'
> {
    model: DeviceModel;
    size: DeviceStorageSize;
}
