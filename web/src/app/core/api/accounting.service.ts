import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
    AccountingAccount,
    AccountingAccountType,
    AccountingTransaction,
} from '../models/accounting';
import { Currency } from '../models/currency';
import { applyFilters } from '../utils/apply-filters';
import { SysEventType } from '../models/event';
import { Order } from '../models/order';

@Injectable({
    providedIn: 'root',
})
export class AccountingService {
    baseUrl: string = environment.baseUrl;
    constructor(private readonly http: HttpClient) {}

    simpleTransaction(data: SimpleTransactionDto): Observable<void> {
        return this.http.post<void>(
            this.baseUrl + 'accounting/simple-transaction',
            data,
        );
    }

    transfer(data: TransferTransactionDto): Observable<void> {
        return this.http.post<void>(this.baseUrl + 'accounting/transfer', data);
    }

    getAccounts(
        type: AccountingAccountType,
        entityId?: number,
    ): Observable<AccountingAccount[]> {
        return this.http.get<AccountingAccount[]>(
            this.baseUrl + 'accounting/accounts',
            { params: { type, ...(entityId ? { entityId } : {}) } },
        );
    }

    search(queryParams: string): Observable<AccountingAccount[]> {
        return this.http.get<AccountingAccount[]>(
            this.baseUrl + 'accounting/accounts?' + queryParams,
        );
    }

    get(id: number): Observable<AccountingAccount> {
        return this.http.get<AccountingAccount>(
            this.baseUrl + 'accounting/accounts/' + id,
        );
    }

    findTransactions(data: FindTransactionsQuery) {
        const params = applyFilters(data);
        return this.http.get<GetTransactionDto[]>(
            this.baseUrl + 'accounting/transactions?' + params.toString(),
        );
    }
}

export interface SimpleTransactionDto {
    accountType: AccountingAccountType;
    providerId?: number;
    clientId?: number;
    userId?: number;
    bankId?: number;
    cashAccountId?: number;
    amount: number;
    currency: 'usd' | 'ars';
    details: string;
}

export interface TransferTransactionDto {
    origin: {
        entityId: number;
        amount: number;
        currency: 'usd' | 'ars';
        type: AccountingAccountType;
    };
    destination: {
        entityId: number;
        amount: number;
        currency: 'usd' | 'ars';
        type: AccountingAccountType;
    };
    details: string;
    exchangeRate: number;
}

export interface FindTransactionsQuery {
    type: AccountingAccountType;
    entityId: number;
    currency?: Currency | Currency[];
    limit?: number;
}

export interface GetTransactionDto extends AccountingTransaction {
    event: {
        type: SysEventType;
        description: string;
        order?: Order;
    };
    currency: Currency;
}
