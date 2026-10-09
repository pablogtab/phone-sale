import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    DeviceModelWithAdjustments,
    ModelAdjustment,
} from '../models/model-adjustment';

@Injectable({
    providedIn: 'root',
})
export class ModelAdjustmentService {
    constructor(private http: HttpClient) {}

    private baseUrl: string = environment.baseUrl;

    getAllModelAdjustments(): Observable<DeviceModelWithAdjustments[]> {
        return this.http.get<DeviceModelWithAdjustments[]>(
            this.baseUrl + `model-adjustment`,
        );
    }

    getById(id: number): Observable<DeviceModelWithAdjustments[]> {
        return this.http.get<DeviceModelWithAdjustments[]>(
            this.baseUrl + `model-adjustment/${id}`,
        );
    }

    create(modelAdjustment: ModelAdjustment): Observable<ModelAdjustment> {
        return this.http.post<ModelAdjustment>(
            this.baseUrl + `model-adjustment`,
            modelAdjustment,
        );
    }

    update(
        id: number,
        modelAdjustment: ModelAdjustment,
    ): Observable<ModelAdjustment> {
        return this.http.patch<ModelAdjustment>(
            this.baseUrl + `model-adjustment/${id}`,
            modelAdjustment,
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(this.baseUrl + `model-adjustment/${id}`);
    }
}
