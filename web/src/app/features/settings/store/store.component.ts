import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { StoreSettingsService } from '../../../core/api/store-settings.service';

@Component({
  selector: 'app-store-settings', imports: [ReactiveFormsModule],
  template: `
    <section class="settings-page">
      <h1>Tu tienda</h1><p class="feature-description">El nombre que acompaña a tu equipo en toda la aplicación.</p>
      <form class="settings-card" (submit)="$event.preventDefault(); save()">
        <div class="brand-preview"><strong>{{ store.name() }}</strong></div>
        <div class="form-field"><label for="store-name">Nombre de la tienda</label><input id="store-name" [formControl]="name" maxlength="60" autocomplete="organization" /></div>
        <p class="field-hint">Se muestra en el inicio de sesión, la navegación y el título de la pestaña.</p>
        @if (message()) { <p role="status" class="inline-success">{{ message() }}</p> }
        @if (error()) { <p role="alert" class="inline-error">{{ error() }}</p> }
        <button type="submit" class="raised primary" [disabled]="saving() || name.invalid || !name.value.trim()">{{ saving() ? 'Guardando…' : 'Guardar nombre' }}</button>
      </form>
    </section>`,
  styles: [`
    .settings-page { padding: 16px; } h1 { margin-bottom: 8px; }
    .settings-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 28px; max-width: 600px; display: flex; flex-direction: column; gap: 20px; }
    .brand-preview { display: flex; align-items: center; gap: 14px; margin-bottom: 6px; overflow-wrap: anywhere; }
    .brand-preview span { width: 48px; height: 48px; flex-shrink: 0; display: grid; place-items: center; border-radius: 12px; background: var(--primary); color: white; font-weight: 700; }
    strong { font-size: 22px; } .field-hint { color: var(--muted); font-size: 12px; } button { align-self: flex-start; }
    @media(max-width: 640px) { .settings-card { padding: 20px; } }
  `],
})
export class StoreComponent {
  readonly store = inject(StoreSettingsService);
  readonly name = new FormControl(this.store.name(), { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(60)] });
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  save() {
    if (this.saving() || this.name.invalid) return;
    this.saving.set(true); this.message.set(''); this.error.set('');
    this.store.save(this.name.value).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => this.message.set('Nombre actualizado en toda la aplicación.'),
      error: () => this.error.set('No pudimos guardar el nombre. Intentá nuevamente.'),
    });
  }
}
