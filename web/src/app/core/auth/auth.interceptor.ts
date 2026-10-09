import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { LOCAL_STORAGE_TOKEN_KEY } from '@/app/core/const';

export function authInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
    const api_token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (api_token && req.url.startsWith('/api/')) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${api_token}`,
            },
        });
    }
    return next(req).pipe(
        catchError((res) => {
            if (res instanceof HttpErrorResponse) {
                if (res.status === 401 && req.url.startsWith('/api/')) {
                    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
                    window.location.href = '/login';
                }
            }
            throw res;
        }),
    );
}
