import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CurrentRole } from '../models/current-role.interface';

@Injectable({
    providedIn: 'root',
})
export class CurrentRoleService {
    protected _currentRole = new BehaviorSubject<CurrentRole>(null);
    currentRole$ = this._currentRole.asObservable();

    setCurrentRole(currentRole: CurrentRole) {
        this._currentRole.next(currentRole);
    }
}
