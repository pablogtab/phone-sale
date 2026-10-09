import { HostControlDirective } from '@/app/shared/directives/host-control.directive';
import { Client } from '@/app/core/models/client';
import { ClientService } from '@/app/core/api/client.service';
import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
    SearchObjectComponent,
    SearchObjectConfig,
} from '../search-object/search-object.component';

type ExtraParams = {
    active: boolean;
    wholesaler: boolean;
};

@Component({
    selector: 'client-search',
    imports: [SearchObjectComponent, ReactiveFormsModule],
    template: `<search-object
        [formControl]="hcd.control"
        [config]="paramsSearcher"
    ></search-object>`,
    hostDirectives: [HostControlDirective],
})
export class ClientSearchComponent {
    hcd = inject(HostControlDirective);

    paramsSearcher: SearchObjectConfig<Client, ExtraParams> = {
        displayWith: (model: Client) => model.name,
        service: ClientService,
        extraParams: { active: true },
    };

    @ViewChild(SearchObjectComponent) searcher: SearchObjectComponent<
        Client,
        ExtraParams
    >;
}
