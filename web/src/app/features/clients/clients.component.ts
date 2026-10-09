import { PaginatorComponent } from '@/app/shared/ui/paginator/paginator.component';
import { SearchTermComponent } from '@/app/shared/ui/search-term/search-term.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { PageStateComponent } from '../../shared/ui/page-state/page-state';
import { PaginationDto } from '@/app/core/pagination';
import { Client } from '@/app/core/models/client';
import { ClientService } from '@/app/core/api/client.service';
import { ExternalsService } from '@/app/core/api/externals.service';
import { FilterService } from '@/app/core/api/filter.service';
import { Dialog } from '@angular/cdk/dialog';
import { Component, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, defer, EMPTY, finalize, startWith, Subject, switchMap } from 'rxjs';
import { AddClientComponent } from './add-client/add-client.component';

@Component({ selector: 'app-clients', imports: [SharedModule, PageStateComponent], templateUrl: './clients.component.html', styleUrl: './clients.component.css' })
export class ClientsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();
  readonly loading = signal(true);
  readonly failed = signal(false);
  clients: Client[] = [];
  totalRows = 0;
  @ViewChild(PaginatorComponent) paginator: PaginatorComponent;
  @ViewChild(SearchTermComponent) search: SearchTermComponent;
  constructor(private router: Router, private dialog: Dialog, private externals: ExternalsService, private clientService: ClientService, private filterService: FilterService<PaginationDto>) {}

  ngAfterViewInit() {
    const params = this.filterService.getParamsFromUrl();
    this.paginator.page = Math.max(1, Number(params.page) || 1);
    this.search.searchTerm.setValue(params.search || '', { emitEvent: false });
    this.reload.pipe(startWith(undefined), switchMap(() => defer(() => {
      this.loading.set(true); this.failed.set(false);
      return this.clientService.getAll({ limit: this.paginator.pageSize, page: this.paginator.page, search: this.search.searchTerm.value.trim() }).pipe(
        catchError(() => { this.failed.set(true); return EMPTY; }),
        finalize(() => this.loading.set(false)),
      );
    })), takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.clients = res.data; this.totalRows = res.totalRows;
      this.paginator.totalPages = res.totalPages; this.paginator.page = res.page;
    });
    this.paginator.pageChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(page => {
      this.filterService.saveStateToUrl({ page }); this.searchClients();
    });
    this.search.onSearch.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(search => {
      this.paginator.page = 1; this.filterService.saveStateToUrl({ search, page: 1 }); this.searchClients();
    });
  }
  searchClients() { this.reload.next(); }
  openModalAddClient() {
    this.dialog.open<Client>(AddClientComponent, { data: { title: 'Nuevo cliente' } }).closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(client => {
      if (!client) return;
      this.paginator.page = 1; this.search.searchTerm.setValue('', { emitEvent: false });
      this.filterService.saveStateToUrl({ page: 1, search: '' }); this.searchClients();
    });
  }
  clientDetail(client: Client) { this.router.navigate(['/clients', client.publicId], { queryParams: this.filterService.getParamsFromUrl() }); }
  whatsapp(client: Client) { this.externals.openWhatsapp(client.phoneNumber); }
  instagram(client: Client) { this.externals.openInstagram(client.instagram); }
  initials(client: Client) { return client.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase(); }
}
