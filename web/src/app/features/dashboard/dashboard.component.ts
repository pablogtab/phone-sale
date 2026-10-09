import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, of, startWith, switchMap, tap } from 'rxjs';
import { DashboardSummary } from '@/app/core/models/dashboard.interface';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
    readonly days = signal(30);
    readonly summary = signal<DashboardSummary | null>(null);
    readonly loading = signal(true);
    readonly error = signal(false);
    private readonly refresh = new Subject<void>();
    readonly maxSale = computed(() => Math.max(1, ...(this.summary()?.series.map(day => day.totalUSD) ?? [])));
    readonly hasSales = computed(() => (this.summary()?.sales.orders ?? 0) > 0);
    readonly stock = computed(() => {
        const inventory = this.summary()?.inventory;
        return inventory ? [
            { label: 'Disponibles', count: inventory.available, color: '#548356' },
            { label: 'Reservados', count: inventory.reserved, color: '#b18b43' },
            { label: 'En reparación', count: inventory.repairing, color: '#59788e' },
            { label: 'En tránsito', count: inventory.transit, color: '#8c7daf' },
            { label: 'Dañados', count: inventory.damaged, color: '#ad665b' },
            { label: 'Perdidos', count: inventory.lost, color: '#8b8580' },
        ] : [];
    });
    readonly labels: Record<string, string> = { confirmed: 'Completada', pending: 'Pendiente', deposited: 'Señada', cancelled: 'Cancelada' };

    constructor() {
        const http = inject(HttpClient);
        this.refresh.pipe(
            startWith(undefined),
            tap(() => { this.loading.set(true); this.error.set(false); }),
            switchMap(() => http.get<DashboardSummary>('/api/dashboard', { params: { days: this.days() } }).pipe(
                catchError(() => { this.error.set(true); return of(null); }),
            )),
            takeUntilDestroyed(inject(DestroyRef)),
        ).subscribe(summary => { this.summary.set(summary); this.loading.set(false); });
    }

    selectPeriod(event: Event) {
        this.days.set(Number((event.target as HTMLSelectElement).value));
        this.reload();
    }

    reload() { this.refresh.next(); }

    dayLabel(date: string) { return `${date.slice(8, 10)}/${date.slice(5, 7)}`; }
}
