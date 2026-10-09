import { SharedModule } from '@/app/shared/ui/shared.module';
import { ClientService, CreateClientDto } from '@/app/core/api/client.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-add-client',
    imports: [SharedModule],
    templateUrl: './add-client.component.html',
    styleUrl: './add-client.component.css',
})
export class AddClientComponent {
    readonly saving = signal(false);
    readonly error = signal('');
    clientForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
        whatsapp: new FormControl(''),
        instagram: new FormControl(''),
        identifier: new FormControl(''),
        address: new FormControl(''),
        birthDate: new FormControl(''),
    });

    data = inject(DIALOG_DATA);

    constructor(
        private readonly dialogRef: DialogRef,
        private readonly message: MessagesService,
        private readonly clientService: ClientService,
    ) {}

    async save() {
        this.clientForm.markAllAsTouched();
        if (this.saving() || this.clientForm.invalid) {
            return;
        }

        //save client
        const obj: CreateClientDto = {
            name: this.clientForm.get('name')?.value.trim() ?? '',
        };

        if (this.clientForm.get('whatsapp')?.value) {
            obj.phoneNumber = String(
                this.clientForm.get('whatsapp')?.value ?? '',
            );
        }

        if (this.clientForm.get('instagram')?.value) {
            obj.instagram = this.clientForm.get('instagram')?.value ?? '';
        }

        if (this.clientForm.get('identifier')?.value) {
            obj.identifier = String(
                this.clientForm.get('identifier')?.value ?? '',
            );
        }

        if (this.clientForm.get('address')?.value) {
            obj.address = this.clientForm.get('address')?.value ?? '';
        }

        if (this.clientForm.get('birthDate')?.value) {
            obj.birthDate = this.clientForm.get('birthDate')?.value ?? '';
        }

        if (!obj.name) return;
        this.saving.set(true); this.error.set('');
        this.dialogRef.disableClose = true;
        this.clientService.create(obj).pipe(finalize(() => { this.saving.set(false); this.dialogRef.disableClose = false; })).subscribe({
            next: client => { this.message.success('Cliente guardado correctamente'); this.dialogRef.close(client); },
            error: () => this.error.set('No pudimos guardar el cliente. Revisá los datos y volvé a intentar.'),
        });
    }

    cancel() {
        this.dialogRef.close();
    }
}
