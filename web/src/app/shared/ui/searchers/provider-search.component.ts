import { HostControlDirective } from '@/app/shared/directives/host-control.directive';
import { Provider } from '@/app/core/models/provider';
import { ProviderService } from '@/app/core/api/provider.service';
import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
    SearchObjectComponent,
    SearchObjectConfig,
} from '../search-object/search-object.component';

@Component({
    selector: 'provider-search',
    imports: [SearchObjectComponent, ReactiveFormsModule],
    template: `<search-object
        [formControl]="hcd.control"
        [config]="paramsSearcher"
    ></search-object>`,
    hostDirectives: [HostControlDirective],
})
export class ProviderSearchComponent {
    hcd = inject(HostControlDirective);

    paramsSearcher: SearchObjectConfig<Provider> = {
        displayWith: (model: Provider) => model.name,
        service: ProviderService,
        extraParams: { active: true },
    };

    @ViewChild(SearchObjectComponent) searcher: SearchObjectComponent<Provider>;
}
