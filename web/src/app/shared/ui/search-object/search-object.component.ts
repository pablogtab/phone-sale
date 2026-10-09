import { HostControlDirective } from '@/app/shared/directives/host-control.directive';
import { Component, DestroyRef, inject, Injector, Input, runInInjectionContext, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from '@openng/optimus-ui/autocomplete';
import { catchError, timer, defer, finalize, Observable, of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'search-object',
  imports: [ReactiveFormsModule, AutoCompleteModule],
  hostDirectives: [HostControlDirective],
  templateUrl: './search-object.component.html',
})
export class SearchObjectComponent<T, K = {}> {
  readonly hcd = inject(HostControlDirective);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queries = new Subject<string>();
  private service: SearchService<T>;
  @Input() config: SearchObjectConfig<T, K>;
  @Input() placeholder = 'Buscar y seleccionar';
  readonly loading = signal(false);
  readonly failed = signal(false);
  options: T[] = [];
  readonly displayLabel = (value: T) => this.safeGetLabel(value);

  ngOnInit() {
    if (!this.config) throw new Error('config is required');
    runInInjectionContext(this.injector, () => { this.service = inject(this.config.service); });
    this.queries.pipe(
      switchMap(query => timer(180).pipe(switchMap(() => defer(() => {
        this.loading.set(true);
        this.failed.set(false);
        const params = new URLSearchParams();
        if (query.trim()) params.set('query', query.trim());
        for (const [key, value] of Object.entries(this.config.extraParams || {})) {
          if (value == null) continue;
          for (const part of Array.isArray(value) ? value : [value]) params.append(key, String(part));
        }
        return this.service.search(params.toString()).pipe(
          catchError(() => { this.failed.set(true); return of([] as T[]); }),
          finalize(() => this.loading.set(false)),
        );
      })))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(options => { this.options = options; });
  }
  searchOptions(event: AutoCompleteCompleteEvent) { this.search(event.query || ''); }
  search(query = '') { this.queries.next(query); }
  safeGetLabel(value: T) { return value && typeof value === 'object' ? this.config.displayWith(value) || '' : ''; }
  findById(id: string | number, { emitEvent } = { emitEvent: true }) {
    this.service.get(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.hcd.control.setValue(value, { emitEvent }),
      error: () => this.failed.set(true),
    });
  }
  setExtraParam<L extends keyof K>(key: L, value: K[L]) {
    this.config.extraParams ||= {};
    this.config.extraParams[key] = value;
  }
}
export type SearchObjectConfig<T, K extends Object = {}> = {
  displayWith: (value: T) => string;
  service: new (...args: any[]) => SearchService<T>;
  extraParams?: { [key in keyof K]?: K[key] | K[key][] };
};
export interface SearchService<T> {
  search(query: string): Observable<T[]>;
  get(id: string | number): Observable<T>;
}
