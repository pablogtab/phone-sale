import { OptionalType } from '@/app/core/types';
import { MessagesService } from '@/app/core/api/messages.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { DialogHeaderComponent } from '../dialog-header/dialog-header.component';

@Component({
    selector: 'app-edit-object',
    imports: [ReactiveFormsModule, DialogHeaderComponent],
    templateUrl: './edit-object.component.html',
    styleUrl: './edit-object.component.css',
})
export class EditObjectComponent<T extends object = any> {
    form = new FormGroup({});

    fields: Field<T>[];

    constructor(
        private modalRef: DialogRef,
        private messages: MessagesService,
        @Inject(DIALOG_DATA) public data: EditObjectData<T>,
    ) {}

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.fields = this.data.fields;
        this.fields.forEach((field) => {
            this.form.addControl(field.key.toString(), new FormControl());
            if (
                this.data.initialValues &&
                field.key in this.data.initialValues
            ) {
                this.form
                    .get(field.key.toString())
                    ?.setValue(this.data.initialValues[field.key]);
            }
        });
    }

    cancel() {
        this.modalRef.close(null);
    }

    async save() {
        const errors = this.validateForm();

        if (errors.length) {
            this.messages.error(errors.join('\n'));
            return;
        }

        if (!this.data.options?.skipQuestionAtSave) {
            const rta = await this.messages.question(
                this.data.options?.questionAtSave ||
                    '¿Está seguro que desea guardar los cambios?',
            );
            if (!rta) return;
        }

        const values = this.form.value;
        this.modalRef.close(values);
    }

    validateForm() {
        const value = this.form.value as any;
        const errors: string[] = [];

        this.fields.forEach((field) => {
            if (
                field.required &&
                (value[field.key.toString()] == null ||
                    String(value[field.key.toString()]).trim() === '')
            ) {
                errors.push(
                    `El campo ${field.label.toLowerCase()} es requerido`,
                );
            }
        });

        return errors;
    }
}

export interface EditObjectData<T> {
    fields: Field<T>[];
    options?: {
        saveButtonText?: string;
        cancelButtonText?: string;
        questionAtSave?: string;
        skipQuestionAtSave?: boolean;
    };
    initialValues?: OptionalType<T>;
    title: string;
}

interface Field<T> {
    label: string;
    key: keyof T;
    type: FieldType;
    options?: { label: string; value: any }[];
    required?: boolean;
}

type FieldType = 'text' | 'number' | 'select' | 'date' | 'color';
