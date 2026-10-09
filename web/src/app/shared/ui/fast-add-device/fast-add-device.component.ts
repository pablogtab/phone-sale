import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { DeviceColor } from '@/app/core/models/device-color';
import { DeviceModel } from '@/app/core/models/device-model';
import { DeviceStorageSize } from '@/app/core/models/device-storage-size';
import { Provider } from '@/app/core/models/provider';
import { DeviceModelService } from '@/app/core/api/device-model.service';
import { CreateDeviceDto } from '@/app/core/api/device.service';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { DeviceModelSearchComponent } from '../searchers/device-model-search.component';
import { SharedModule } from '../shared.module';
import { collapsableOpen } from '@/app/core/utils/animations/collapsable-open.animation';

@Component({
    selector: 'app-fast-add-device',
    imports: [SharedModule, DeviceModelSearchComponent],
    animations: [collapsableOpen],
    templateUrl: './fast-add-device.component.html',
})
export class FastAddDeviceComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    private deviceModelService = inject(DeviceModelService);

    availableColors: DeviceColor[] = [];
    availableStorageSizes: DeviceStorageSize[] = [];
    form = new FormGroup({
        model: new FormControl<DeviceModel>(null),
        sealed: new FormControl(false),
        batteryHealth: new FormControl(null, [
            Validators.min(0),
            Validators.max(100),
            Validators.pattern(/^\d+$/),
        ]),
        batteryCicleCount: new FormControl(null, [Validators.min(0)]),
        oficialWarranty: new FormControl(false),
        hasProblem: new FormControl(false),
        warrantyExpiresAt: new FormControl<string>(null, [
            Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
        ]),
        imei: new FormControl(null, Validators.pattern(/^\d{15}$/)),
        imei2: new FormControl(null, Validators.pattern(/^\d{15}$/)),
        colorId: new FormControl(null),
        storageSizeId: new FormControl(null),
        internalComments: new FormControl(null),
        publicComments: new FormControl(null),
        mainPhotoFile: new FormControl<File>(null),
        originProvider: new FormControl<Provider>(null),
        purchasePrice: new FormControl<number>(null),
        hasBeenTested: new FormControl(false),
    });

    ngOnInit(): void {
        this.form.controls.model.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((model) => {
                if (!model) {
                    this.availableColors = [];
                    this.availableStorageSizes = [];
                    this.form.controls.colorId.setValue(null);
                    this.form.controls.storageSizeId.setValue(null);
                    return;
                }
                this.deviceModelService
                    .get(model.id)
                    .pipe(
                        refreshView(this.viewChangeDetector, this.viewLifetime),
                    )
                    .subscribe((model) => {
                        this.availableColors = model.availableColors;
                        this.availableStorageSizes =
                            model.availableStorageSizes;
                    });
            });

        this.form.controls.imei.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((val) => {
                if (!val?.length) this.form.controls.imei2.setValue(null);
            });
    }

    toggleColor(id: number) {
        this.form.controls.colorId.setValue(
            this.form.controls.colorId.value === id ? null : id,
        );
    }

    toggleStorageSize(id: number) {
        this.form.controls.storageSizeId.setValue(
            this.form.controls.storageSizeId.value === id ? null : id,
        );
    }

    isValid() {
        return Boolean(
            this.form.valid &&
            this.form.controls.colorId.value &&
            this.form.controls.storageSizeId.value &&
            this.form.controls.model.value,
        );
    }

    get parsedLabel(): string {
        //model + color + storage + batteryHealth + (imei last four digits)

        const model = this.form.controls.model.value?.name ?? '';

        const color =
            this.availableColors.find(
                (c) => c.id === this.form.controls.colorId.value,
            )?.name ?? '';

        const storage =
            this.availableStorageSizes.find(
                (s) => s.id === this.form.controls.storageSizeId.value,
            )?.size ?? '';

        const batteryHealth = this.form.controls.batteryHealth.value
            ? ` ${this.form.controls.batteryHealth.value}%`
            : '';

        const imei = this.form.controls.imei.value
            ? ` (${this.form.controls.imei.value.slice(-4)})`
            : '';

        return `${model} ${color} ${storage}${batteryHealth}${imei}`;
    }

    get createDevice(): CreateDeviceDto {
        return {
            colorId: this.form.controls.colorId.value,
            modelId: this.form.controls.model.value.id,
            storageSizeId: this.form.controls.storageSizeId.value,
            condition: this.form.controls.sealed.value ? 'sealed' : 'used',
            batteryHealth: this.form.controls.batteryHealth.value,
            batteryCicleCount: this.form.controls.batteryCicleCount.value,
            oficialWarranty: this.form.controls.oficialWarranty.value,
            hasProblem: this.form.controls.hasProblem.value,
            warrantyExpiresAt: this.form.controls.warrantyExpiresAt.value,
            imei: this.form.controls.imei.value,
            imei2: this.form.controls.imei2.value,
            internalComments: this.form.controls.internalComments.value,
            publicComments: this.form.controls.publicComments.value,
            hasBeenTested: this.form.controls.hasBeenTested.value,
        };
    }
}
