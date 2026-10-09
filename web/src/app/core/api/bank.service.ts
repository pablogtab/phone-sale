import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Bank } from '../models/bank';

@Injectable({
    providedIn: 'root',
})
export class BankService {
    baseUrl: string = environment.baseUrl;

    constructor(private readonly http: HttpClient) {}

    get(id: number): Observable<Bank> {
        return this.http.get<Bank>(this.baseUrl + 'banks/' + id);
    }

    search(queryParams: string): Observable<Bank[]> {
        return this.http.get<Bank[]>(
            this.baseUrl + 'banks/search?' + queryParams,
        );
    }
}
