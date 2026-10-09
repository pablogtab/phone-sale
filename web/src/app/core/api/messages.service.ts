import { Dialog } from '@angular/cdk/dialog';
import { Injectable } from '@angular/core';
import {
    AlertComponent,
    AlertData,
    AlertType,
} from '../../shared/ui/alert/alert.component';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class MessagesService {
    constructor(private dialog: Dialog) {}

    showPublicError(
        err: HttpErrorResponse,
        defaultMessage: string = 'Ocurrió un error inesperado',
    ) {
        if (err.error && err.error.public) {
            return this.error(err.error.message);
        } else {
            return this.error(defaultMessage);
        }
    }

    question(
        message: string,
        opts: {
            disableAutoClose?: boolean;
            buttonYes?: string;
            buttonNo?: string;
        } = {},
    ): Promise<boolean> {
        const obj: AlertData = {
            message,
            type: 'question',
            ...opts,
        };

        return new Promise((resolve) => {
            const dialogRef = this.dialog.open<Boolean>(AlertComponent, {
                panelClass: 'dialog-alert',
                data: obj,
                autoFocus: false,
                restoreFocus: false,
                disableClose: opts.disableAutoClose,
                backdropClass: 'backdrop-alert-question',
            });

            dialogRef.closed.subscribe((result) => {
                resolve(!!result);
            });
        });
    }

    private fire(data: {
        message: string;
        type?: Omit<AlertType, 'question'>;
        timer?: number;
    }) {
        const obj: AlertData = {
            message: data.message,
            timer: data.timer,
            type: (data.type as AlertType) || 'success',
        };

        this.dialog.open(AlertComponent, {
            panelClass: 'dialog-alert',
            data: obj,
            autoFocus: false,
            restoreFocus: false,
        });
    }

    error(message: string, timer?: number) {
        this.fire({ message, type: 'error', timer });
    }

    success(message: string, timer: number = 2500) {
        this.fire({ message, type: 'success', timer });
    }

    warning(message: string, timer?: number) {
        this.fire({ message, type: 'warning', timer });
    }
}
