import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DeviceModel } from '@/app/core/models/device-model';
import { DeviceColor } from '@/app/core/models/device-color';
import { DeviceStorageSize } from '@/app/core/models/device-storage-size';
import { OptionalType } from '@/app/core/types';
import { DevicePriceReference } from '../models/device-price-reference';
import { Product } from '../models/product';

@Injectable({
    providedIn: 'root',
})
export class DeviceModelService {
    baseUrl: string = environment.baseUrl;
    constructor(private readonly http: HttpClient) {}

    get(id: number): Observable<DeviceModelAndRelations> {
        return this.http.get<DeviceModelAndRelations>(
            this.baseUrl + 'devices/models/' + id,
        );
    }

    update(id: number, data: UpdateDeviceModelDto): Observable<DeviceModel> {
        return this.http.patch<DeviceModelAndRelations>(
            this.baseUrl + 'devices/models/' + id,
            data,
        );
    }

    getAll(
        data: { includePriceReferences?: boolean } = {},
    ): Observable<DeviceModelAndRelations[]> {
        const params = new URLSearchParams();

        if (data.includePriceReferences)
            params.append('includePriceReferences', 'true');

        return this.http.get<DeviceModelAndRelations[]>(
            this.baseUrl + 'devices/models?' + params.toString(),
        );
    }

    create(data: CreateDeviceModelDto): Observable<DeviceModel> {
        return this.http.post<DeviceModel>(
            this.baseUrl + 'devices/models/',
            data,
        );
    }

    updateIndexes(data: { id: number; index: number }[]): Observable<void> {
        return this.http.put<void>(this.baseUrl + 'devices/models/indexes', {
            data,
        });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(this.baseUrl + 'devices/models/' + id);
    }

    search(queryParams: string): Observable<DeviceModel[]> {
        return this.http.get<DeviceModel[]>(
            this.baseUrl + 'devices/models/search?' + queryParams,
        );
    }
}

export interface CreateDeviceModelDto {
    name: string;
    colors: number[];
    storageSizes: number[];
    recommendedAccesories: number[];
}

export type DeviceModelAndRelations = DeviceModel & {
    availableColors: DeviceColor[];
    availableStorageSizes: DeviceStorageSize[];
    priceReferences?: DevicePriceReference[];
    recommendedAccesories?: Product[];
};

export type UpdateDeviceModelDto = OptionalType<CreateDeviceModelDto> & {};
