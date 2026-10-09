import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Parameter, PublicParameterKey } from '@/app/core/parameter';

@Injectable({
    providedIn: 'root',
})
export class ParameterService {
    baseUrl: string = environment.baseUrl;
    constructor(private http: HttpClient) {}

    updateParameter(key: PublicParameterKey, values: { valueN?: number; valueS?: string }) {
        return this.http.patch<Parameter>(this.baseUrl + "parameters/" + key, values);
    }

    getParameter(key: PublicParameterKey) {
        return this.http.get<Parameter>(this.baseUrl + 'parameters/' + key);
    }
}
