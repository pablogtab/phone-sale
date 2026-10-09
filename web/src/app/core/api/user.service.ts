import { environment } from '@/environments';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@/app/core/models/user';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private baseUrl: string = environment.baseUrl;
    private myUser?: User;

    constructor(private http: HttpClient) {
        this.getMyUser().subscribe();
    }

    changeProfilePicture(image: File): Observable<string> {
        const formData = new FormData();
        formData.append('file', image);
        return this.http
            .post<string>(this.baseUrl + 'users/profile-picture', formData)
            .pipe(
                tap((newUrl) => {
                    this.myUser.profilePicture = newUrl;
                }),
            );
    }

    reloadUser() {
        this.myUser = undefined;
        this.getMyUser().subscribe();
    }

    getMyUser(): Observable<User> {
        if (this.myUser) {
            return new Observable((subscriber) => {
                subscriber.next(this.myUser);
                subscriber.complete();
            });
        }
        return this.http
            .get<User>(this.baseUrl + 'users/me')
            .pipe(tap((user) => (this.myUser = user)));
    }

    get(id: number): Observable<User> {
        return this.http.get<User>(this.baseUrl + 'users/' + id);
    }

    search(queryParams: string): Observable<User[]> {
        return this.http.get<User[]>(
            this.baseUrl + 'users/search?' + queryParams,
        );
    }

    create(user: Partial<User>): Observable<User> {
        return this.http.post<User>(this.baseUrl + 'users/', user);
    }

    update(user: Partial<User>): Observable<User> {
        return this.http.patch<User>(this.baseUrl + `users/${user.id}`, user);
    }
}
