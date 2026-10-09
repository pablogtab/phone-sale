import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { User } from '@/app/core/models/user';
import { DeviceService } from '@/app/core/api/device.service';
import { UserService } from '@/app/core/api/user.service';
import { environment } from '@/environments';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

@Component({
    selector: 'app-device-test-process',
    imports: [SharedModule],
    templateUrl: './device-test-process.component.html',
    styleUrl: './device-test-process.component.css',
})
export class DeviceTestProcessComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    private dialogRef = inject(DialogRef);
    private data: DeviceTestProcessParams = inject(DIALOG_DATA);
    private service: UserService = inject(UserService);
    private deviceService = inject(DeviceService);
    public baseFilesUrl: string = environment.filesUrl;

    user: User;
    constructor() {}

    ngOnInit() {
        this.service
            .getMyUser()
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((user) => (this.user = user));
    }

    save() {
        if (!this.data.deviceId || !this.user) return;
        this.deviceService
            .testDevice({
                deviceId: this.data.deviceId,
                testerUserPublicId: this.user.publicId,
            })
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.dialogRef.close(true);
            });
    }

    cancel() {
        this.dialogRef.close(false);
    }

    get userHasProfilePicture() {
        return Boolean(this.user?.profilePicture);
    }
}

export type DeviceTestProcessParams = {
    deviceId: number;
};
