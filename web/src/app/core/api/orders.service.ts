import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Paginated, PaginationDto } from '../pagination';
import { Client } from '../models/client';
import { Order, OrderItem, OrderPayment, OrderStatus } from '../models/order';
import { Product } from '../models/product';
import { OrderPaymentDto as CreateOrderPaymentDto } from '../../features/orders/edit-order/new-order-payment/new-order-payment.component';
import { applyFilters } from '../utils/apply-filters';
import { DeviceAndFile } from './device.service';

@Injectable({
    providedIn: 'root',
})
export class OrdersService {
    baseUrl: string = environment.baseUrl;

    constructor(private readonly http: HttpClient) {}

    createOrder(order: CreateOrderDto): Observable<Order> {
        return this.http.post<Order>(this.baseUrl + 'orders', order);
    }

    findOrders(
        filter: FindOrderFilter = {},
    ): Observable<Paginated<Order & { clientName: string }>> {
        return this.http.get<Paginated<Order & { clientName: string }>>(
            this.baseUrl + 'orders?' + applyFilters(filter).toString(),
        );
    }

    getOrderByPublic(orderPublicId: string): Observable<OrderAndDetails> {
        return this.http.get<OrderAndDetails>(
            this.baseUrl + 'orders/' + orderPublicId,
        );
    }

    continueOrder(
        orderPublicId: string,
        data: CreateOrderDto & { deliveredByUserId: number },
    ): Observable<Order> {
        delete data.clientId;
        delete data.exchangeRate;
        delete data.credit;
        delete data.type;
        return this.http.post<Order>(
            this.baseUrl + 'orders/continue/' + orderPublicId,
            data,
        );
    }

    cancelOrder(orderPublicId: string): Observable<Order> {
        return this.http.post<Order>(
            this.baseUrl + 'orders/cancel/' + orderPublicId,
            {},
        );
    }
}

export interface CreateOrderDto {
    clientId: number;
    exchangeRate: number;
    products: CreateOrderItemDto[];
    payments: CreateOrderPaymentDto[];
    type: 'faceid' | 'sale' | 'wholesale';
    deliveredByUserId?: number;
    credit?: boolean;
}

export interface FindOrderFilter extends PaginationDto {
    clientId?: number;
    status?: OrderStatus | OrderStatus[];
}

interface CreateOrderItemDto {
    productId: number;
    priceUSD: number;
    priceARS: number;
    quantity: number;
    exchangeRate: number;
}

export interface OrderAndDetails extends Order {
    client: Client;
    items: (OrderItem & { product: Product & { device?: DeviceAndFile } })[];
    payments: (OrderPayment & { device?: DeviceAndFile })[];
}
