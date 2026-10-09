import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { Device } from '@/app/core/models/device';
import { Provider } from '@/app/core/models/provider';
import {
    DeviceService,
    UpdateDeviceTechnicalServiceDto,
} from '@/app/core/api/device.service';
import { ProviderService } from '@/app/core/api/provider.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { Observable, map } from 'rxjs';
import { SelectModule } from '@openng/optimus-ui/select';
import { TextareaModule } from '@openng/optimus-ui/textarea';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { MessagesService } from '@/app/core/api/messages.service';

@Component({
    selector: 'app-service',
    imports: [
        CommonModule,
        SelectModule,
        FormsModule,
        ReactiveFormsModule,
        TextareaModule,
        DatePickerModule,
    ],
    templateUrl: './service.component.html',
    styleUrl: './service.component.css',
})
export class ServiceComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    private deviceService = inject(DeviceService);
    private providerService = inject(ProviderService);
    private messages = inject(MessagesService);
    private dialogRef = inject(DialogRef);
    data: { deviceId: number } = inject(DIALOG_DATA);
    device$: Observable<Device>;
    providers$: Observable<Provider[]>;

    form = new FormGroup({
        providerId: new FormControl<number>(null),
        reason: new FormControl<string>(null),
        date: new FormControl<Date>(new Date()),
    });

    ngOnInit(): void {
        this.providers$ = this.providerService.search('').pipe(
            map((data) => {
                return data.filter((x) => x.technicalService);
            }),
        );
        if (this.data.deviceId) {
            this.fetchDevice();
        }
    }

    fetchDevice() {
        this.device$ = this.deviceService.get(this.data.deviceId);
    }

    save() {
        this.device$
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((device: Device) => {
                const updatedDevice: UpdateDeviceTechnicalServiceDto = {
                    technicalServiceDate: this.form.value.date,
                    technicalServiceDescription: this.form.value.reason,
                    technicalServiceProviderId: this.form.value.providerId,
                };
                if (
                    !updatedDevice.technicalServiceDate ||
                    !updatedDevice.technicalServiceDescription ||
                    !updatedDevice.technicalServiceProviderId
                ) {
                    this.messages.error('Debe completar todos los datos');
                    return;
                }
                this.deviceService
                    .updateDeviceTechnicalService(device.id, updatedDevice)
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
