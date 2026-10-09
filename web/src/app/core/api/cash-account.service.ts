import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CashAccount } from '../models/cash-account';

@Injectable({
    providedIn: 'root',
})
export class CashAccountService {
    baseUrl: string = environment.baseUrl;

    constructor(private readonly http: HttpClient) {}

    get(id: number): Observable<CashAccount> {
        return this.http.get<CashAccount>(this.baseUrl + 'cash-accounts/' + id);
    }

    search(queryParams: string): Observable<CashAccount[]> {
        return this.http.get<CashAccount[]>(
            this.baseUrl + 'cash-accounts/search?' + queryParams,
        );
    }
}
