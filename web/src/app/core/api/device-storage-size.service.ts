import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OptionalType } from '@/app/core/types';
import { DeviceStorageSize } from '@/app/core/models/device-storage-size';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DeviceStorageSizeService {
    baseUrl: string = environment.baseUrl;
    constructor(private readonly http: HttpClient) {}

    create(data: CreateDeviceStorageSizeDto): Observable<DeviceStorageSize> {
        return this.http.post<DeviceStorageSize>(
            this.baseUrl + 'devices/storage-size',
            data,
        );
    }

    getAll(): Observable<DeviceStorageSize[]> {
        return this.http.get<DeviceStorageSize[]>(
            this.baseUrl + 'devices/storage-size',
        );
    }

    update(
        id: number,
        data: UpdateDeviceStorageSizeDto,
    ): Observable<DeviceStorageSize> {
        return this.http.patch<DeviceStorageSize>(
            this.baseUrl + 'devices/storage-size/' + id,
            data,
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(
            this.baseUrl + 'devices/storage-size/' + id,
        );
    }

    updateIndexes(data: { id: number; index: number }[]): Observable<void> {
        return this.http.put<void>(
            this.baseUrl + 'devices/storage-size/indexes',
            { data },
        );
    }
}

export interface CreateDeviceStorageSizeDto {
    size: string;
}

export type UpdateDeviceStorageSizeDto =
    OptionalType<CreateDeviceStorageSizeDto> & {
        active?: boolean;
    };
