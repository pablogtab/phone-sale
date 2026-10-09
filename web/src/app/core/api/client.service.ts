import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Paginated, paginatedURLParams, PaginationDto } from '../pagination';
import { OptionalType } from '../types';
import { Client } from '../models/client';

@Injectable({
    providedIn: 'root',
})
export class ClientService {
    baseUrl: string = environment.baseUrl;
    constructor(private readonly http: HttpClient) {}

    search(query: string): Observable<Client[]> {
        return this.http.get<Client[]>(
            this.baseUrl + 'clients/search?' + query,
        );
    }

    getAll(dto: PaginationDto = {}): Observable<Paginated<Client>> {
        const params = paginatedURLParams(dto);
        return this.http.get<Paginated<Client>>(
            this.baseUrl + 'clients' + params,
        );
    }

    create(client: CreateClientDto): Observable<Client> {
        return this.http.post<Client>(this.baseUrl + 'clients', client);
    }

    get(id: string): Observable<Client> {
        return this.http.get<Client>(this.baseUrl + 'clients/' + id);
    }

    update(id: string, client: UpdateClientDto): Observable<Client> {
        return this.http.patch<Client>(this.baseUrl + 'clients/' + id, client);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(this.baseUrl + 'clients/' + id);
    }
}

export interface CreateClientDto {
    name: string;
    phoneNumber?: string;
    instagram?: string;
    identifier?: string;
    address?: string;
    birthDate?: string;
    wholesaler?: boolean;
}

export type UpdateClientDto = OptionalType<CreateClientDto>;
