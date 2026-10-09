import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Product } from '../models/product';
import { Order } from '../models/order';

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    baseUrl: string = environment.baseUrl;

    constructor(private readonly http: HttpClient) {}

    get(id: number): Observable<Product> {
        return this.http.get<Product>(this.baseUrl + 'products/' + id);
    }

    search(queryParams: string): Observable<Product[]> {
        return this.http.get<Product[]>(
            this.baseUrl + 'products/search?' + queryParams,
        );
    }

    price(
        id: number,
        orderType: Order['type'] = 'faceid',
    ): Observable<{ price: number }> {
        return this.http.post<{ price: number }>(
            this.baseUrl + 'products/price/',
            { productId: id, orderType },
        );
    }

    devicePrice(
        modelId: number,
        sizeId: number,
    ): Observable<{ price: number }> {
        return this.http.post<{ price: number }>(
            this.baseUrl + 'products/device-price/',
            { modelId, sizeId },
        );
    }

    create(product: CreateProductDto) {
        return this.http.post(this.baseUrl + 'products/', product);
    }

    edit(product: EditProductDto, productId: number) {
        return this.http.put(this.baseUrl + 'products/' + productId, product);
    }

    delete(productId: number) {
        return this.http.delete(this.baseUrl + 'products/' + productId);
    }
}

export interface CreateProductDto {
    description: string;
    stock: number;
    sellingPrice: number;
    costPrice: number;
}

export interface EditProductDto extends CreateProductDto {}
