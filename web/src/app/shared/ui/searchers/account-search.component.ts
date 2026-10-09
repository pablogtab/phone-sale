import { HostControlDirective } from '@/app/shared/directives/host-control.directive';
import { AccountingAccount } from '@/app/core/models/accounting';
import { AccountingService } from '@/app/core/api/accounting.service';
import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
    SearchObjectComponent,
    SearchObjectConfig,
} from '../search-object/search-object.component';

@Component({
    selector: 'account-search',
    imports: [SearchObjectComponent, ReactiveFormsModule],
    template: `<search-object
        [formControl]="hcd.control"
        [config]="paramsSearcher"
    ></search-object>`,
    hostDirectives: [HostControlDirective],
})
export class AccountSearchComponent {
    hcd = inject(HostControlDirective);

    paramsSearcher: SearchObjectConfig<AccountingAccount> = {
        displayWith: (o: AccountingAccount) =>
            `${o.name} (${o.currency === 'usd' ? 'USD' : 'ARS'})`,
        service: AccountingService,
        extraParams: { type: 'provider' },
    };

    @ViewChild(SearchObjectComponent)
    searcher: SearchObjectComponent<AccountingAccount>;
}
