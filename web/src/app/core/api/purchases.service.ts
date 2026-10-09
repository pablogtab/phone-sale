import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PurchasesService {
    baseUrl: string = environment.baseUrl;

    constructor(private readonly http: HttpClient) {}

    new(data: CreatePurchase) {
        return this.http.post(this.baseUrl + 'purchases', data);
    }
}

export interface CreatePurchase {
    providerId: number;
    total: number;
    exchangeRate: number;
    products: CreatePurchaseProduct[];
    payments: CreatePurchasePayment[];
}

export type CreatePurchaseProduct = {
    quantity: number;
    price: number;
} & (
    | {
          productId: number;
          type: 'product';
      }
    | {
          modelId: number;
          storageSizeId: number;
          colorId: number;
          type: 'device';
      }
);

export type CreatePurchasePayment = {
    amount: number;
    currency: 'usd' | 'ars';
} & (
    | {
          type: 'cash';
          cashAccountId: number;
      }
    | {
          type: 'bank';
          bankId: number;
      }
    | {
          type: 'credit';
      }
);
