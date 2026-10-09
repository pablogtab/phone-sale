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
import { SharedModule } from '@/app/shared/ui/shared.module';
import { DeviceColor } from '@/app/core/models/device-color';
import { DeviceColorService } from '@/app/core/api/device-color.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { Dialog, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-device-color-settings',
    imports: [SharedModule],
    templateUrl: './device-color-settings.component.html',
    styleUrl: './device-color-settings.component.css',
})
export class DeviceColorSettingsComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    colors: DeviceColor[] = [];

    toggleControls: { [key: string]: FormControl } = {};

    constructor(
        private dialog: Dialog,
        private messages: MessagesService,
        private deviceColorService: DeviceColorService,
        @Inject(DIALOG_DATA) public readonly data: { title: string },
    ) {}

    ngOnInit(): void {
        this.loadColors();
    }

    openNew() {
        const data: EditObjectData<DeviceColor> = {
            fields: [
                {
                    key: 'name',
                    label: 'Nombre del color',
                    type: 'text',
                    required: true,
                },
                {
                    key: 'hex',
                    label: 'Color referencia',
                    type: 'color',
                    required: true,
                },
            ],
            initialValues: {
                name: '',
                hex: '#000000',
            },
            title: 'Nuevo color',
        };

        this.dialog
            .open<DeviceColor>(EditObjectComponent, { data })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe((obj: DeviceColor) => {
                if (!obj) return;

                this.deviceColorService
                    .create(obj)
                    .pipe(
                        refreshView(this.viewChangeDetector, this.viewLifetime),
                    )
                    .subscribe(() => {
                        this.loadColors();
                        this.messages.success('Color creado');
                    });
            });
    }

    openEdit(obj: DeviceColor) {
        const data: EditObjectData<DeviceColor> = {
            fields: [
                {
                    key: 'name',
                    label: 'Nombre del color',
                    type: 'text',
                    required: true,
                },
                {
                    key: 'hex',
                    label: 'Color referencia',
                    type: 'color',
                    required: true,
                },
            ],
            initialValues: obj,
            title: 'Editar color',
        };

        this.dialog
            .open<DeviceColor>(EditObjectComponent, { data })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe((ret: DeviceColor) => {
                if (!ret) return;

                this.deviceColorService
                    .update(obj.id, ret)
                    .pipe(
                        refreshView(this.viewChangeDetector, this.viewLifetime),
                    )
                    .subscribe(() => {
                        this.loadColors();
                        this.messages.success('Color actualizado');
                    });
            });
    }

    loadColors() {
        this.deviceColorService
            .getAll()
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((colors) => {
                this.toggleControls = colors.reduce(
                    (acc, color) => {
                        acc[color.id] = new FormControl(color.active);
                        return acc;
                    },
                    {} as { [key: string]: FormControl },
                );
                this.colors = colors;
            });
    }

    async deleteColor(color: DeviceColor) {
        const rta = await this.messages.question(
            `¿Estás seguro de eliminar este color?`,
        );

        if (!rta) return;

        this.deviceColorService
            .delete(color.id)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.loadColors();
                this.messages.success('Color eliminado');
            });
    }

    async toggleActive(cond: boolean, color: DeviceColor) {
        const rta = await this.messages.question(
            `¿Estás seguro de ${cond ? 'activar' : 'desactivar'} este color?`,
        );
        if (!rta) {
            this.toggleControls[color.id].setValue(!cond, { emitEvent: false });
            return;
        }
        this.deviceColorService
            .update(color.id, { active: cond })
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe();
    }
}
