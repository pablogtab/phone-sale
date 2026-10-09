import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Provider } from '../models/provider';

@Injectable({
    providedIn: 'root',
})
export class ProviderService {
    baseUrl: string = environment.baseUrl;

    constructor(private readonly http: HttpClient) {}

    get(id: number): Observable<Provider> {
        return this.http.get<Provider>(this.baseUrl + 'providers/id/' + id);
    }

    search(queryParams: string): Observable<Provider[]> {
        return this.http.get<Provider[]>(
            this.baseUrl + 'providers/search?' + queryParams,
        );
    }
}
