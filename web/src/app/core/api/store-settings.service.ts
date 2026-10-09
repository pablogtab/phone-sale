import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { catchError, firstValueFrom, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StoreSettingsService {
  private readonly http = inject(HttpClient);
  readonly name = signal('Mi tienda');
  readonly initials = computed(() => this.name().split(/\s+/).filter(Boolean).slice(0, 2).map(word => [...word][0]).join('').toUpperCase());
  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.name()} · Gestión`));
  }
  async load() {
    return firstValueFrom(this.http.get<{ name: string }>('/api/store-settings').pipe(
      tap(settings => this.name.set(settings.name)),
      catchError(() => of({ name: this.name() })),
    ));
  }
  save(name: string) {
    return this.http.patch<{ name: string }>('/api/store-settings', { name: name.trim() }).pipe(tap(settings => this.name.set(settings.name)));
  }
}
