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
import { Device } from '@/app/core/models/device';
import { DeviceColor } from '@/app/core/models/device-color';
import { DeviceFile, DeviceFileType } from '@/app/core/models/device-file';
import { DeviceModel } from '@/app/core/models/device-model';
import { DeviceStorageSize } from '@/app/core/models/device-storage-size';
import { Provider } from '@/app/core/models/provider';
import { DeviceModelService } from '@/app/core/api/device-model.service';
import { CreateDeviceDto, DeviceService } from '@/app/core/api/device.service';
import { FileService } from '@/app/core/api/file-service.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { collapsableOpen } from '@/app/core/utils/animations/collapsable-open.animation';
import { environment } from '@/environments';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
    CdkDragDrop,
    DragDropModule,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { DeviceModelSearchComponent } from '../../../shared/ui/searchers/device-model-search.component';
import { SharedModule } from '../../../shared/ui/shared.module';
import { ProviderSearchComponent } from '@/app/shared/ui/searchers/provider-search.component';

@Component({
    imports: [
        SharedModule,
        DeviceModelSearchComponent,
        ProviderSearchComponent,
        DragDropModule,
    ],
    animations: [collapsableOpen],
    templateUrl: './edit-device.component.html',
    styleUrl: './edit-device.component.css',
})
export class EditDeviceComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    baseFileUrl: string = environment.filesUrl;

    private deviceService = inject(DeviceService);
    private deviceModelService = inject(DeviceModelService);
    private fileService = inject(FileService);
    private messages = inject(MessagesService);
    private dialog = inject(Dialog);
    private dialogRef = inject(DialogRef);

    originalDevice: Device;
    data: EditDeviceDialogParams = inject(DIALOG_DATA);

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
        depreciation: new FormControl<number>(null),
    });

    mainFile: File;
    mainPhotoUrl: string = null;

    availableColors: DeviceColor[] = [];
    availableStorageSizes: DeviceStorageSize[] = [];

    aditionalFiles: DeviceFile[] = [];
    aditionalFilesToUpload: ToUploadFile[] = [];

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

        if (this.data.deviceId) {
            this.fetchDevice();
        }
    }

    fetchDevice() {
        this.deviceService
            .get(this.data.deviceId)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((device) => {
                this.form.controls.model.setValue(device.model);
                this.form.controls.sealed.setValue(
                    device.condition === 'sealed',
                );
                this.form.controls.batteryHealth.setValue(device.batteryHealth);
                this.form.controls.batteryCicleCount.setValue(
                    device.batteryCicleCount,
                );
                this.form.controls.oficialWarranty.setValue(
                    device.oficialWarranty,
                );
                this.form.controls.hasProblem.setValue(device.hasProblem);
                this.form.controls.warrantyExpiresAt.setValue(
                    device.warrantyExpiresAt,
                );
                this.form.controls.imei.setValue(device.imei);
                this.form.controls.imei2.setValue(device.imei2);
                this.form.controls.colorId.setValue(device.colorId);
                this.form.controls.storageSizeId.setValue(device.storageSizeId);
                this.form.controls.internalComments.setValue(
                    device.internalComments,
                );
                this.form.controls.publicComments.setValue(
                    device.publicComments,
                );
                this.form.controls.depreciation.setValue(device.depreciation);
                this.mainPhotoUrl = device.mainPhotoUrl;
                this.aditionalFiles = device.aditionalFiles.sort(
                    (a, b) => a.index - b.index,
                );
                if (device.originProvider) {
                    this.form.controls.originProvider.setValue(
                        device.originProvider,
                    );
                    this.form.controls.purchasePrice.setValue(
                        device.purchasePrice,
                    );
                }
                this.originalDevice = device;
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

    ngAfterViewInit(): void {}

    async newFile() {
        const file = await this.fileService.selectFile<File>({
            accept: 'image/*, video/*, application/pdf',
        });
        if (!file) return;

        const type: DeviceFileType = file.type.startsWith('image')
            ? 'image'
            : file.type.startsWith('video')
              ? 'video'
              : 'pdf';

        const data: EditObjectData<{ description: string }> = {
            fields: [
                {
                    label: 'Descripción',
                    key: 'description',
                    type: 'text',
                    required: true,
                },
            ],
            initialValues: { description: 'Detalle' },
            title: 'Ingrese descripción',
            options: {
                skipQuestionAtSave: true,
            },
        };

        this.dialog
            .open<{ description: string }>(EditObjectComponent, { data })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe((obj) => {
                if (!obj) return;
                this.aditionalFilesToUpload.push({
                    file,
                    description: obj.description,
                    index: this.aditionalFilesToUpload.length,
                    uri: URL.createObjectURL(file),
                    type,
                });
            });
    }

    async deleteMainPhoto() {
        const confirm = await this.messages.question(
            'Esto eliminará completamente la foto principal ¿Desea continuar?',
        );
        if (!confirm) return;

        this.deviceService
            .deleteMainPhoto(this.data.deviceId)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.mainPhotoUrl = null;
                this.mainFile = null;
            });
    }

    drop(event: CdkDragDrop<ToUploadFile>) {
        moveItemInArray(
            this.aditionalFilesToUpload,
            event.previousIndex,
            event.currentIndex,
        );
    }

    dropSavedFiles(event: CdkDragDrop<DeviceFile>) {
        moveItemInArray(
            this.aditionalFiles,
            event.previousIndex,
            event.currentIndex,
        );
        this.deviceService
            .updateDeviceFileIndexes(
                this.originalDevice.publicId,
                this.aditionalFiles.map((file, index) => ({
                    publicId: file.publicId,
                    index: index + 1,
                })),
            )
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe();
    }

    async deleteSavedFile(index: number, fileId: string) {
        const confirm = await this.messages.question(
            'Esto eliminará completamente el archivo ¿Desea continuar?',
        );
        if (!confirm) return;

        this.deviceService
            .deleteAditionalFile(fileId)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.aditionalFiles.splice(index, 1);
            });
    }

    deleteToUploadFile(index: number) {
        this.aditionalFilesToUpload.splice(index, 1);
    }

    validateForm() {
        const errors: string[] = [];

        if (!this.form.controls.model.value) {
            errors.push('El modelo es requerido');
        }

        if (!this.form.controls.colorId.value) {
            errors.push('El color es requerido');
        }

        if (!this.form.controls.storageSizeId.value) {
            errors.push('La capacidad de almacenamiento es requerida');
        }

        if (
            this.form.controls.warrantyExpiresAt.value &&
            !this.form.controls.warrantyExpiresAt.valid
        ) {
            errors.push('La fecha de garantía no es válida');
        }

        if (
            this.form.controls.batteryHealth.value &&
            this.form.controls.batteryHealth.invalid
        ) {
            errors.push('La salud de la batería no es válida');
        }

        if (
            this.form.controls.batteryCicleCount.value &&
            this.form.controls.batteryCicleCount.invalid
        ) {
            errors.push('El ciclo de carga de la batería no es válido');
        }

        if (this.form.controls.imei.value && this.form.controls.imei.invalid) {
            errors.push('El IMEI no es válido');
        }

        if (
            this.form.controls.originProvider.value &&
            !this.form.controls.purchasePrice.value
        ) {
            errors.push('El precio de compra es requerido');
        }

        return errors;
    }

    async save() {
        const errors = this.validateForm();

        if (errors.length) {
            this.messages.error(errors.join('\n'));
            return;
        }

        const rta = await this.messages.question('¿Está seguro de continuar?');
        if (!rta) return;

        if (this.isEdit) {
            this.editDevice();
        } else {
            this.newDevice();
        }
    }

    uploadMainPhoto($event: any) {
        const file = $event.target.files[0];
        this.form.controls.mainPhotoFile.setValue(file);
        this.mainFile = file;
    }

    newDevice() {
        this.deviceService
            .create(this.deviceValues)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((device) => {
                this.messages.success('Dispositivo creado correctamente');
                this.dialogRef.close(device);
            });
    }

    editDevice() {
        this.deviceService
            .update(this.data.deviceId, this.deviceValues)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((device) => {
                this.messages.success('Dispositivo actualizado correctamente');
                this.dialogRef.close(device);
            });
    }

    get deviceValues(): CreateDeviceDto {
        const values = this.form.getRawValue();

        return {
            modelId: values.model.id,
            colorId: values.colorId,
            storageSizeId: values.storageSizeId,
            condition: values.sealed ? 'sealed' : 'used',
            batteryHealth: values.batteryHealth,
            batteryCicleCount: values.batteryCicleCount,
            oficialWarranty: values.oficialWarranty,
            hasProblem: values.hasProblem,
            warrantyExpiresAt: values.warrantyExpiresAt,
            imei: values.imei ? values.imei : null,
            imei2: values.imei2 ? values.imei2 : null,
            internalComments: values.internalComments,
            publicComments: values.publicComments,
            mainPhoto: this.mainFile,
            aditionalFiles: this.aditionalFilesToUpload,
            originProviderId: values.originProvider?.id,
            purchasePrice: values.purchasePrice,
            depreciation: values.depreciation,
        };
    }

    get isEdit() {
        return Boolean(this.data.deviceId);
    }
}

type ToUploadFile = {
    file: File;
    description: string;
    index: number;
    uri: string;
    type: DeviceFileType;
};

export interface EditDeviceDialogParams {
    title: string;
    deviceId?: number;
}
