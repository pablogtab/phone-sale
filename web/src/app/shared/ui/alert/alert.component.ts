import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-alert',
    imports: [IconComponent],
    templateUrl: './alert.component.html',
    styleUrl: './alert.component.css',
})
export class AlertComponent {
    data: AlertData = inject(DIALOG_DATA);
    dialogRef: DialogRef = inject(DialogRef);

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        if (!isNaN(this.data.timer)) {
            setTimeout(() => this.dialogRef.close(), this.data.timer);
        }
    }
}

export type AlertData = {
    message: string;
    title?: string;
    timer?: number;
    type: AlertType;
    canClose?: boolean;
    buttonYes?: string;
    buttonNo?: string;
};

export type AlertType = 'success' | 'error' | 'warning' | 'question';
