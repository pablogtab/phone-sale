import { Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '@/environments';
import { DialogHeaderComponent } from '@/app/shared/ui/dialog-header/dialog-header.component';

export const ACCOUNT_CREATION = {
    bank: { title: 'Nueva cuenta de banco', endpoint: 'banks' },
    cash_account: { title: 'Nueva caja', endpoint: 'cash-accounts' },
    provider: { title: 'Nuevo proveedor', endpoint: 'providers' },
} as const;

@Component({
    imports: [ReactiveFormsModule, DialogHeaderComponent],
    template: `
        <dialog-header [title]="config.title" />
        <form [formGroup]="form" (ngSubmit)="save()" class="account-form">
            <label for="account-name">Nombre *</label>
            <input id="account-name" formControlName="name" maxlength="50" autocomplete="off" />
            @if (form.controls.name.touched && form.controls.name.invalid) { <p class="error" role="alert">Ingresá un nombre de 3 a 50 caracteres.</p> }
            <p>Se crean las cuentas en USD y ARS con saldo inicial cero.</p>
            @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
            <footer>
                <button type="button" class="stroked primary" [disabled]="saving()" (click)="ref.close()">Cancelar</button>
                <button type="submit" class="raised primary" [disabled]="saving()">{{ saving() ? 'Guardando…' : 'Crear cuenta' }}</button>
            </footer>
        </form>`,
    styles: `:host{display:block}.account-form{padding:8px 24px 24px;display:flex;flex-direction:column;gap:12px}.account-form p{color:var(--text-2);font-size:.875rem}.account-form p.error{color:var(--warn)}footer{display:flex;justify-content:flex-end;gap:12px;margin-top:12px}`,
})
export class CreateAccountComponent {
    private http = inject(HttpClient);
    ref = inject(DialogRef);
    type = inject(DIALOG_DATA) as keyof typeof ACCOUNT_CREATION;
    config = ACCOUNT_CREATION[this.type];
    form = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)] }) });
    saving = signal(false);
    error = signal('');
    private destroyed = inject(DestroyRef);
    save() {
        if (this.saving()) return;
        this.form.controls.name.setValue(this.form.controls.name.value.trim());
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        this.saving.set(true);
        this.error.set('');
        this.http.post(environment.baseUrl + this.config.endpoint, this.form.getRawValue())
            .pipe(takeUntilDestroyed(this.destroyed)).subscribe({
                next: () => this.ref.close(true),
                error: () => { this.saving.set(false); this.error.set('No se pudo crear la cuenta. Podés reintentar.'); },
            });
    }
}
