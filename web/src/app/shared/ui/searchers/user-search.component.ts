import { HostControlDirective } from '@/app/shared/directives/host-control.directive';
import { User } from '@/app/core/models/user';
import { UserService } from '@/app/core/api/user.service';
import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
    SearchObjectComponent,
    SearchObjectConfig,
} from '../search-object/search-object.component';

@Component({
    selector: 'user-search',
    imports: [SearchObjectComponent, ReactiveFormsModule],
    template: `<search-object
        [formControl]="hcd.control"
        [config]="paramsSearcher"
    ></search-object>`,
    hostDirectives: [HostControlDirective],
})
export class UserSearchComponent {
    hcd = inject(HostControlDirective);

    paramsSearcher: SearchObjectConfig<User> = {
        displayWith: (user) => user.name,
        service: UserService,
        // extraParams: { active: true }
    };

    @ViewChild(SearchObjectComponent) searcher: SearchObjectComponent<User>;
}
