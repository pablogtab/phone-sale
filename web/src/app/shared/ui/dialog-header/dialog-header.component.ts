import { Component, inject, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
    selector: 'dialog-header',
    imports: [IconComponent],
    templateUrl: './dialog-header.component.html',
})
export class DialogHeaderComponent {
    @Input() title: string;

    dialogRef = inject(DialogRef);

    handleClose() {
        this.dialogRef.close();
    }
}
