import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { Client } from '@/app/core/models/client';
import { ClientService, UpdateClientDto } from '@/app/core/api/client.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { Component, Input, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-client-detail',
    imports: [SharedModule],
    templateUrl: './client-detail.component.html',
    styleUrl: './client-detail.component.css',
})
export class ClientDetailComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    clientId: string;
    client: Client;

    @Input() set id(clientId: string) {
        this.clientId = clientId;
    }

    clientForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
        whatsapp: new FormControl(''),
        instagram: new FormControl(''),
        identifier: new FormControl(''),
        address: new FormControl(''),
        birthDate: new FormControl(''),
        wholesaler: new FormControl<boolean>(false),
    });

    constructor(
        private router: Router,
        private message: MessagesService,
        private clientService: ClientService,
    ) {}

    readonly loading = signal(true);
    readonly failed = signal(false);
    readonly saving = signal(false);
    back() {
        this.router.navigate(['/clients']);
    }
    get birthDateLabel() {
        const value = this.client?.birthDate;
        if (!value) return 'Sin registrar';
        const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
        return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
    }
    ngOnInit() {
        this.clientForm.disable();
        this.loadClient();
    }
    loadClient() {
        this.loading.set(true);
        this.failed.set(false);
        this.clientService
            .get(this.clientId)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: (client) => {
                    this.client = client;
                    this.loadForm(client);
                    this.loading.set(false);
                },
                error: () => {
                    this.failed.set(true);
                    this.loading.set(false);
                },
            });
    }

    loadForm(client: Client) {
        this.clientForm.get('name')?.setValue(client.name);
        this.clientForm.get('whatsapp')?.setValue(client.phoneNumber);
        this.clientForm.get('instagram')?.setValue(client.instagram);
        this.clientForm.get('identifier')?.setValue(client.identifier);
        this.clientForm.get('address')?.setValue(client.address);
        const date = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(client.birthDate || '');
        this.clientForm
            .get('birthDate')
            ?.setValue(
                date ? `${date[3]}-${date[2]}-${date[1]}` : client.birthDate,
            );
        this.clientForm.get('wholesaler')?.setValue(client.wholesaler);
    }

    cancel() {
        this.loadForm(this.client);
        this.clientForm.disable();
    }

    edit() {
        this.clientForm.enable();
    }

    save() {
        if (this.saving() || this.clientForm.disabled) return;
        if (
            this.clientForm.invalid ||
            !this.clientForm.controls.name.value?.trim()
        ) {
            this.message.error('El nombre es requerido');
            return;
        }
        const dto: UpdateClientDto = {
            address: this.clientForm.get('address')?.value,
            birthDate: this.clientForm.get('birthDate')?.value
                ? this.clientForm.get('birthDate')?.value
                : null,
            identifier: this.clientForm.get('identifier')?.value,
            instagram: this.clientForm.get('instagram')?.value,
            name: this.clientForm.get('name')?.value.trim(),
            phoneNumber: this.clientForm.get('whatsapp')?.value,
            wholesaler: this.clientForm.get('wholesaler')?.value,
        };

        this.saving.set(true);
        this.clientService
            .update(this.clientId, dto)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: (data) => {
                    this.message.success('Cliente actualizado correctamente');
                    this.client = data;
                    this.saving.set(false);
                    this.clientForm.disable();
                },
                error: (err) => {
                    this.saving.set(false);
                    this.message.showPublicError(err);
                },
            });
    }

    async deleteClient() {
        const rta = await this.message.question(
            '¿Está seguro de eliminar este cliente?',
        );
        if (!rta) return;

        this.clientService
            .delete(this.clientId)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.message.success('Cliente eliminado correctamente');
                this.router.navigate(['clients']);
            });
    }
}
