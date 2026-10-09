import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { Device } from '@/app/core/models/device';
import { DeviceService } from '@/app/core/api/device.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { SelectModule } from '@openng/optimus-ui/select';
import { TextareaModule } from '@openng/optimus-ui/textarea';
import { Observable, of } from 'rxjs';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';

@Component({
    selector: 'app-service-detail',
    imports: [
        CommonModule,
        SelectModule,
        FormsModule,
        ReactiveFormsModule,
        TextareaModule,
        DatePickerModule,
        ToggleSwitchModule,
    ],
    templateUrl: './service-detail.component.html',
    styleUrl: './service-detail.component.css',
})
export class ServiceDetailComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    private deviceService = inject(DeviceService);
    private messages = inject(MessagesService);
    private dialogRef = inject(DialogRef);
    data: { deviceId: number } = inject(DIALOG_DATA);
    device$: Observable<Device>;
    form = new FormGroup({
        bateryReplacement: new FormControl<boolean>(true),
        depreciation: new FormControl<number>(null),
        internalComments: new FormControl(null),
        serviceCost: new FormControl<number>(0),
        technicalServiceDescription: new FormControl(null),
    });

    ngOnInit(): void {
        if (this.data.deviceId) {
            this.fetchDevice();
        }
    }
    fetchDevice() {
        this.deviceService
            .get(this.data.deviceId)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: (device) => {
                    this.device$ = of(device);
                    this.form.controls.depreciation.setValue(
                        device.depreciation,
                    );
                    this.form.controls.internalComments.setValue(
                        device.internalComments,
                    );
                    this.form.controls.technicalServiceDescription.setValue(
                        device.technicalServiceDescription,
                    );
                },
                error: () => {},
            });
    }

    save() {
        this.device$
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((device: Device) => {
                const createDeviceTechnicalDetailDto = {
                    depreciation: this.form.value.depreciation,
                    internalComments: this.form.value.internalComments,
                    technicalServiceDescription:
                        this.form.value.technicalServiceDescription,
                    serviceCost: this.form.value.serviceCost,
                    bateryReplacement: this.form.value.bateryReplacement,
                };
                if (
                    typeof createDeviceTechnicalDetailDto.bateryReplacement !==
                        'boolean' ||
                    !createDeviceTechnicalDetailDto.technicalServiceDescription ||
                    !Number.isFinite(
                        createDeviceTechnicalDetailDto.serviceCost,
                    ) ||
                    createDeviceTechnicalDetailDto.serviceCost < 0
                ) {
                    this.messages.error('Debe completar todos los datos');
                    return;
                }
                this.deviceService
                    .createDeviceTechnicalDetail(
                        device.id,
                        createDeviceTechnicalDetailDto,
                    )
                    .pipe(
                        refreshView(this.viewChangeDetector, this.viewLifetime),
                    )
                    .subscribe({
                        next: (res) => {
                            this.dialogRef.close(device);
                        },
                        error: (err) => {
                            console.log(err);
                        },
                    });
            });
    }
}
