import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ParameterService } from '../../core/api/parameter.service';
import { PageStateComponent } from '../../shared/ui/page-state/page-state';

@Component({
  selector: 'app-dolar', imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, PageStateComponent],
  templateUrl: './dolar.component.html', styleUrl: './dolar.component.css',
})
export class DolarComponent {
  private readonly parameters = inject(ParameterService);
  private readonly destroyRef = inject(DestroyRef);
  readonly rate = new FormControl<number>(null, [Validators.required, Validators.min(0.01), Validators.max(100000000)]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly failed = signal(false);
  readonly message = signal('');
  readonly saveError = signal('');
  dolar = 0;
  updatedAt: Date | null = null;
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true); this.failed.set(false);
    this.parameters.getParameter('dolar_hoy_cba_price').pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: data => { this.dolar = data.valueN || 0; this.rate.setValue(this.dolar || null); this.updatedAt = new Date(data.updatedAt); },
      error: () => this.failed.set(true),
    });
  }
  save() {
    this.rate.markAsTouched();
    if (this.rate.invalid || this.saving()) return;
    this.saving.set(true); this.message.set(''); this.saveError.set('');
    this.parameters.updateParameter('dolar_hoy_cba_price', { valueN: this.rate.value }).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving.set(false))).subscribe({
      next: data => { this.dolar = data.valueN; this.updatedAt = new Date(data.updatedAt); this.message.set('Cotización guardada. Se usará como referencia en nuevas operaciones.'); },
      error: () => this.saveError.set('No pudimos guardar la cotización. Tus cambios siguen acá para volver a intentar.'),
    });
  }
}
