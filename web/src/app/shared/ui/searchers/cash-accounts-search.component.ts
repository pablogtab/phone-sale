import { HostControlDirective } from '@/app/shared/directives/host-control.directive';
import { CashAccount } from '@/app/core/models/cash-account';
import { CashAccountService } from '@/app/core/api/cash-account.service';
import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
    SearchObjectComponent,
    SearchObjectConfig,
} from '../search-object/search-object.component';

@Component({
    selector: 'cash-accounts-search',
    imports: [SearchObjectComponent, ReactiveFormsModule],
    template: `<search-object
        [formControl]="hcd.control"
        [config]="paramsSearcher"
    ></search-object>`,
    hostDirectives: [HostControlDirective],
})
export class CashAccountsSearchComponent {
    hcd = inject(HostControlDirective);
    paramsSearcher: SearchObjectConfig<CashAccount> = {
        displayWith: (cashAccount) => cashAccount.name,
        service: CashAccountService,
        extraParams: {
            active: true,
        },
    };

    @ViewChild(SearchObjectComponent)
    searcher: SearchObjectComponent<CashAccount>;
}
