import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import {
    ADJUSTMENT_CATEGORIES,
    ADJUSTMENT_TYPES,
    DeviceModelWithAdjustments,
    ModelAdjustment,
} from '@/app/core/models/model-adjustment';
import { ModelAdjustmentService } from '@/app/core/api/model-adjustment.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, finalize, of } from 'rxjs';
import { TableModule } from '@openng/optimus-ui/table';
import { ToastModule } from '@openng/optimus-ui/toast';
import { TagModule } from '@openng/optimus-ui/tag';
import { SelectModule } from '@openng/optimus-ui/select';
import { ButtonModule } from '@openng/optimus-ui/button';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from '@openng/optimus-ui/api';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { MessagesService } from '@/app/core/api/messages.service';

@Component({
    selector: 'app-model-adjustment',
    imports: [
        TableModule,
        ToastModule,
        CommonModule,
        TagModule,
        SelectModule,
        ButtonModule,
        InputTextModule,
        FormsModule,
        SharedModule,
    ],
    templateUrl: './model-adjustment.component.html',
    styleUrl: './model-adjustment.component.css',
    providers: [MessageService],
})
export class ModelAdjustmentComponent implements OnInit {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    deviceModelWithAdjustmentsSubject = new BehaviorSubject<
        DeviceModelWithAdjustments[]
    >(null);
    deviceModelWithAdjustments$: Observable<DeviceModelWithAdjustments[]> =
        this.deviceModelWithAdjustmentsSubject.asObservable();

    types = Object.entries(ADJUSTMENT_TYPES).map(([key, value]) => ({
        label: value,
        value: key,
    }));
    categories = Object.entries(ADJUSTMENT_CATEGORIES).map(([key, value]) => ({
        label: value,
        value: key,
    }));
    loading: boolean = true;

    constructor(
        private modelAdjustmentService: ModelAdjustmentService,
        private readonly messages: MessagesService,
    ) {}

    ngOnInit(): void {
        this.deviceModelWithAdjustmentsSubject
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((res) => {
                this.deviceModelWithAdjustments$ = of(res);
            });

        this.getAllModelAdjustments();
    }

    getAllModelAdjustments() {
        this.loading = true;
        this.modelAdjustmentService
            .getAllModelAdjustments()
            .pipe(finalize(() => (this.loading = false)))
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: (data) =>
                    this.deviceModelWithAdjustmentsSubject.next(data),
                error: (err) => console.log(err),
            });
    }

    onRowEditInit(a: any) {}

    onRowEditSave(a: ModelAdjustment) {
        if (!this.validate(a)) {
            this.getAllModelAdjustments();
            return;
        }
        if (a.id) {
            this.modelAdjustmentService
                .update(a.id, a)
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe({
                    next: (data) => {
                        this.messages.success('Ajuste modificado');
                        this.getAllModelAdjustments();
                    },
                    error: (err) => {
                        console.log(err);
                        this.messages.error('No se pudo modificar el ajuste');
                    },
                });
        } else {
            this.modelAdjustmentService
                .create(a)
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe({
                    next: (data) => {
                        this.getAllModelAdjustments();
                        this.messages.success('Ajuste agregado');
                    },
                    error: (err) => {
                        console.log(err);
                        this.messages.error('No se pudo actualizar el ajuste');
                    },
                });
        }
    }

    validate(adjustment: ModelAdjustment): boolean {
        let valid: boolean = false;
        if (!adjustment.description || !adjustment.type) {
            this.messages.warning('Debe seleccionar el tipo y categoria');
            return valid;
        }

        if (
            (adjustment.rangeEnd != null && adjustment.rangeStart == null) ||
            (adjustment.rangeEnd == null && adjustment.rangeStart != null)
        ) {
            this.messages.warning('No puede definir solo un rango');
            return valid;
        }

        if (
            adjustment.rangeStart &&
            adjustment.rangeStart > adjustment.rangeEnd
        ) {
            this.messages.warning('Desde no puede ser mayor al Hasta');
            return valid;
        }

        if (!adjustment.factor) {
            this.messages.warning('El valor $ es obligatorio');
            return valid;
        }

        return true;
    }

    onRowEditCancel(a: any, b: any) {
        this.getAllModelAdjustments();
    }

    async deleteRow(a: ModelAdjustment) {
        const rta = await this.messages.question(
            '¿Está seguro de que desea eliminar este ajuste?',
        );
        if (!rta) return;

        this.modelAdjustmentService
            .delete(a.id)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: () => {
                    this.messages.success('Ajuste eliminado');
                    this.getAllModelAdjustments();
                },
                error: () => {
                    this.messages.error('No se pudo eliminar el ajuste');
                },
            });
    }

    addRow(model: DeviceModelWithAdjustments, newModel?: ModelAdjustment) {
        const newAdjustment = new ModelAdjustment();
        newAdjustment.modelId = model.modelId;
        newAdjustment.factor = 0;
        newAdjustment.rangeEnd = 0;
        newAdjustment.rangeStart = 0;

        const index = this.deviceModelWithAdjustmentsSubject.value.findIndex(
            (x) => x.modelId === model.modelId,
        );

        if (index !== -1) {
            this.deviceModelWithAdjustmentsSubject.value[
                index
            ].modelAdjustments.push(newAdjustment);
        }

        this.deviceModelWithAdjustmentsSubject.next([
            ...this.deviceModelWithAdjustmentsSubject.value,
        ]);
    }
}
