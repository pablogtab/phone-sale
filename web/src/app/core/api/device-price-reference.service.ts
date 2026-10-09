import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DevicePriceReference } from '../models/device-price-reference';

@Injectable({
    providedIn: 'root',
})
export class DevicePriceReferenceService {
    baseUrl: string = environment.baseUrl;
    constructor(private readonly http: HttpClient) {}

    upsert(data: UpsertDeviceReference[]): Observable<void> {
        return this.http.post<void>(this.baseUrl + 'devices/price-reference/', {
            data,
        });
    }

    find(
        modelId: number,
        storageSizeId: number,
        isUsed: boolean,
    ): Observable<DevicePriceReference> {
        return this.http.post<DevicePriceReference>(
            this.baseUrl + 'devices/price-reference/find',
            { modelId, storageSizeId, isUsed },
        );
    }
}

export interface UpsertDeviceReference extends Omit<
    DevicePriceReference,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
> {}
