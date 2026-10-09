import { PageStateComponent } from '../../shared/ui/page-state/page-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginatorComponent } from '@/app/shared/ui/paginator/paginator.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { Order, ORDER_STATUSES } from '@/app/core/models/order';
import { FilterService } from '@/app/core/api/filter.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { OrderAndDetails, OrdersService } from '@/app/core/api/orders.service';
import {
    Component,
    DestroyRef,
    inject,
    signal,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-orders',
    imports: [SharedModule, PageStateComponent],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css',
})
export class OrdersComponent {
    @ViewChild(PaginatorComponent) paginator: PaginatorComponent;
    private readonly destroyRef = inject(DestroyRef);
    readonly loading = signal(true);
    readonly failed = signal(false);
    router = inject(Router);
    messages = inject(MessagesService);
    filterService = inject(FilterService);
    ordersService = inject(OrdersService);
    private requestId = 0;
    orders: (Order & { clientName: string })[] = [];

    ngAfterViewInit(): void {
        this.findOrders();
        this.paginator.pageChange
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.findOrders());
    }

    findOrders() {
        const request = ++this.requestId;
        this.loading.set(true);
        this.failed.set(false);
        this.ordersService
            .findOrders({
                page: this.paginator.page,
                limit: this.paginator.pageSize,
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    if (request !== this.requestId) return;
                    this.orders = res.data;
                    this.paginator.page = res.page;
                    this.paginator.totalPages = res.totalPages;
                    this.loading.set(false);
                },
                error: () => {
                    if (request !== this.requestId) return;
                    this.failed.set(true);
                    this.loading.set(false);
                },
            });
    }

    newOrder() {
        this.router.navigate(['/orders/order']);
    }

    orderDetails(order: Order) {
        this.router.navigate(['/orders/order', order.publicId]);
    }

    async cancelOrder(order: Order) {
        const rta = await this.messages.question(
            'Está seguro que desea cancelar la orden? Esta acción no se puede deshacer',
            { buttonYes: 'Cancelar Orden', buttonNo: 'Volver' },
        );

        if (!rta) return;

        //TODO: Verificar si los dispositivos entregados como parte de pago de la orden se pueden eliminar,
        // si no se pueden se debe repreguntar al usuario si desea continuar sin eliminar esos equipos

        this.ordersService.cancelOrder(order.publicId).subscribe((res) => {
            this.messages.success('Orden cancelada correctamente');
            // this.orders = this.orders.filter(o => o.publicId !== order.publicId)
            this.findOrders();
        });
    }

    getOrderStatus(order: Order) {
        return ORDER_STATUSES[order.status];
    }
}
