import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OptionalType } from '@/app/core/types';
import {
    Device,
    DeviceCondition,
    DeviceStatusTranslation,
} from '@/app/core/models/device';
import { DeviceColor } from '@/app/core/models/device-color';
import { DeviceFile } from '@/app/core/models/device-file';
import { DeviceModel } from '@/app/core/models/device-model';
import { DeviceStorageSize } from '@/app/core/models/device-storage-size';
import { Provider } from '@/app/core/models/provider';
import { applyFilters } from '@/app/core/utils/apply-filters';
import { Observable } from 'rxjs';
import { DeviceHistory } from '../models/device-history';

@Injectable({
    providedIn: 'root',
})
export class DeviceService {
    baseUrl: string = environment.baseUrl;
    constructor(private readonly http: HttpClient) {}

    get(id: number): Observable<DetailedDevice> {
        return this.http.get<DetailedDevice>(
            this.baseUrl + 'devices/devices/' + id,
        );
    }

    updateDeviceTechnicalService(
        id: number,
        data: UpdateDeviceTechnicalServiceDto,
    ): Observable<Device> {
        const formData = new FormData();
        formData.append(
            'technicalServiceDate',
            data.technicalServiceDate.toISOString(),
        );
        formData.append(
            'technicalServiceProviderId',
            data.technicalServiceProviderId?.toString(),
        );
        formData.append(
            'technicalServiceDescription',
            data.technicalServiceDescription,
        );

        return this.http.patch<Device>(
            this.baseUrl + 'devices/devices/' + id + '/technicalService',
            data,
        );
    }

    createDeviceTechnicalDetail(
        id: number,
        data: CreateDeviceTechnicalDetailDto,
    ): Observable<Device> {
        return this.http.patch<Device>(
            this.baseUrl + 'devices/devices/' + id + '/technicalService/detail',
            data,
        );
    }

    update(id: number, data: UpdateDeviceDto): Observable<Device> {
        const formData = new FormData();

        if (data.mainPhoto) {
            formData.append('mainPhoto', data.mainPhoto);
        }
        if (data.aditionalFiles) {
            data.aditionalFiles.forEach((file) => {
                formData.append('aditionalFiles', file.file);
                formData.append('aditionalFilesDescriptions', file.description);
            });
        }

        delete data.mainPhoto;
        delete data.aditionalFiles;

        (Object.keys(data) as (keyof UpdateDeviceDto)[]).forEach((key) => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key] as any);
            }
        });

        return this.http.patch<Device>(
            this.baseUrl + 'devices/devices/' + id,
            formData,
        );
    }

    getAll(): Observable<DeviceAndRelations[]> {
        return this.http.get<DeviceAndRelations[]>(
            this.baseUrl + 'devices/devices/',
        );
    }

    testDevice(data: TestDeviceDto): Observable<void> {
        return this.http.post<void>(
            this.baseUrl + 'devices/devices/test-device',
            data,
        );
    }

    undoTestDevice(deviceId: number): Observable<void> {
        return this.http.post<void>(
            this.baseUrl + 'devices/devices/undo-test-device/' + deviceId,
            {},
        );
    }

    create(data: CreateDeviceDto): Observable<Device> {
        const formData = new FormData();

        if (data.mainPhoto) {
            formData.append('mainPhoto', data.mainPhoto);
        }
        if (data.aditionalFiles) {
            data.aditionalFiles.forEach((file) => {
                formData.append('aditionalFiles', file.file);
                formData.append('aditionalFilesDescriptions', file.description);
            });
        }

        delete data.mainPhoto;
        delete data.aditionalFiles;

        (Object.keys(data) as (keyof CreateDeviceDto)[]).forEach((key) => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key] as any);
            }
        });

        return this.http.post<Device>(
            this.baseUrl + 'devices/devices/',
            formData,
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(this.baseUrl + 'devices/devices/' + id);
    }

    getFiltered(dto: SearchDeviceDto = {}): Observable<DeviceAndFile[]> {
        return this.search(applyFilters(dto).toString());
    }

    getDeviceFiles(id: number): Observable<DeviceFile[]> {
        return this.http.get<DeviceFile[]>(
            this.baseUrl + 'devices/devices/files/' + id,
        );
    }

    search(queryParams: string): Observable<Device[]> {
        return this.http.get<Device[]>(
            this.baseUrl + 'devices/devices?' + queryParams,
        );
    }

    deleteMainPhoto(deviceId: number): Observable<void> {
        return this.http.delete<void>(
            this.baseUrl + 'devices/devices/main-photo/' + deviceId,
        );
    }

    deleteAditionalFile(fileId: string): Observable<void> {
        return this.http.delete<void>(
            this.baseUrl + 'devices/devices/aditional-file/' + fileId,
        );
    }

    //file-indexes/:device-uuid
    updateDeviceFileIndexes(
        devicePublicId: string,
        files: { publicId: string; index: number }[],
    ): Observable<void> {
        return this.http.put<void>(
            this.baseUrl + 'devices/devices/file-indexes/' + devicePublicId,
            files,
        );
    }

    setAsAvailable(deviceId: number) {
        return this.http.post<void>(
            this.baseUrl + 'devices/devices/set-as-available/' + deviceId,
            {},
        );
    }
}

export interface CreateDeviceDto {
    condition: DeviceCondition;
    internalComments?: string;
    publicComments?: string;
    batteryCicleCount?: number;
    batteryHealth?: number;
    imei?: string;
    imei2?: string;
    hasProblem: boolean;
    oficialWarranty: boolean;
    warrantyExpiresAt?: string;
    modelId: number;
    storageSizeId: number;
    colorId: number;
    originProviderId?: number;
    purchasePrice?: number;
    hasBeenTested?: boolean;
    depreciation?: number;
    technicalServiceProviderId?: number;
    technicalServiceDate?: Date;
    technicalServiceDescription?: string;
    technicalServiceHistory?: string;
    mainPhoto?: File;
    aditionalFiles?: { file: File; description: string }[];
}

export type DeviceAndRelations = Device & {};

export type UpdateDeviceDto = OptionalType<CreateDeviceDto> & {};

export type UpdateDeviceTechnicalServiceDto = {
    technicalServiceProviderId: number;
    technicalServiceDate: Date;
    technicalServiceDescription: string;
};

export type CreateDeviceTechnicalDetailDto = {
    depreciation: number;
    internalComments: string;
    technicalServiceDescription: string;
    serviceCost: number;
    bateryReplacement: boolean;
};

export type SearchDeviceDto = {
    query?: string;
    modelId?: number | number[];
    colorId?: number | number[];
    storageSizeId?: number | number[];
    status?: DeviceStatusTranslation | DeviceStatusTranslation[];
};

export type DeviceAndFile = Device & { mainPhotoUrl?: string };

export type DetailedDevice = Device & {
    model: DeviceModel;
    color: DeviceColor;
    storageSize: DeviceStorageSize;
    originProvider?: Provider;
    mainPhotoUrl?: string;
    testedByUser: string;
    aditionalFiles?: DeviceFile[];
    deviceHistory: DeviceHistory[];
};

export type TestDeviceDto = {
    deviceId: number;
    testerUserPublicId: string;
};
