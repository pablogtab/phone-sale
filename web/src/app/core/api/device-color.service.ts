import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { OptionalType } from '@/app/core/types';
import { DeviceColor } from '@/app/core/models/device-color';

@Injectable({
    providedIn: 'root',
})
export class DeviceColorService {
    baseUrl: string = environment.baseUrl;
    constructor(private readonly http: HttpClient) {}

    create(client: CreateDeviceColorDto): Observable<DeviceColor> {
        return this.http.post<DeviceColor>(
            this.baseUrl + 'devices/color',
            client,
        );
    }

    getAll(): Observable<DeviceColor[]> {
        return this.http.get<DeviceColor[]>(this.baseUrl + 'devices/color');
    }

    update(id: number, client: UpdateDeviceColorDto): Observable<DeviceColor> {
        return this.http.patch<DeviceColor>(
            this.baseUrl + 'devices/color/' + id,
            client,
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(this.baseUrl + 'devices/color/' + id);
    }

    getByModelId(modelId: number): Observable<DeviceColor[]> {
        return this.http.get<DeviceColor[]>(
            this.baseUrl + 'devices/color/model/' + modelId,
        );
    }
}

export interface CreateDeviceColorDto {
    name: string;
    hex: string;
}

export type UpdateDeviceColorDto = OptionalType<CreateDeviceColorDto> & {
    active?: boolean;
};
