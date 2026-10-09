import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    LOCAL_STORAGE_TOKEN_KEY,
    LOCAL_STORAGE_USER_KEY,
} from '@/app/core/const';
import { PermissionConfig, UserRole } from '@/app/core/permissions';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    baseUrl: string = environment.baseUrl;
    constructor(private readonly http: HttpClient) {}

    login(username: string, password: string) {
        return this.http.post<LoginData>(this.baseUrl + 'login/username', {
            username,
            password,
        });
    }

    saveData(data: LoginData) {
        const token = data.token;
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
        const user = data.user;
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    }

    removeData() {
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
}

interface LoginData {
    token: string;
    user: {
        userId: string;
        name: string;
        lastname: string;
        role: UserRole;
        permissions: PermissionConfig;
    };
}
