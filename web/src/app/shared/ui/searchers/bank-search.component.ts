import { HostControlDirective } from '@/app/shared/directives/host-control.directive';
import { Bank } from '@/app/core/models/bank';
import { BankService } from '@/app/core/api/bank.service';
import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
    SearchObjectComponent,
    SearchObjectConfig,
} from '../search-object/search-object.component';

@Component({
    selector: 'bank-search',
    imports: [SearchObjectComponent, ReactiveFormsModule],
    template: `<search-object
        [formControl]="hcd.control"
        [config]="paramsSearcher"
    ></search-object>`,
    hostDirectives: [HostControlDirective],
})
export class BankSearchComponent {
    hcd = inject(HostControlDirective);

    paramsSearcher: SearchObjectConfig<Bank> = {
        displayWith: (bank) => bank.name,
        service: BankService,
        extraParams: { active: true },
    };

    @ViewChild(SearchObjectComponent) searcher: SearchObjectComponent<Bank>;
}
