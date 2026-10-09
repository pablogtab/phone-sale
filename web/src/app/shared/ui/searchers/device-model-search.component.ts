import { HostControlDirective } from '@/app/shared/directives/host-control.directive';
import { DeviceModel } from '@/app/core/models/device-model';
import { DeviceModelService } from '@/app/core/api/device-model.service';
import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
    SearchObjectComponent,
    SearchObjectConfig,
} from '../search-object/search-object.component';

@Component({
    selector: 'device-model-search',
    imports: [SearchObjectComponent, ReactiveFormsModule],
    template: `<search-object
        [formControl]="hcd.control"
        [config]="paramsSearcher"
    ></search-object>`,
    hostDirectives: [HostControlDirective],
})
export class DeviceModelSearchComponent {
    hcd = inject(HostControlDirective);

    paramsSearcher: SearchObjectConfig<DeviceModel> = {
        displayWith: (model: DeviceModel) => model.name,
        service: DeviceModelService,
        extraParams: { active: true },
    };

    @ViewChild(SearchObjectComponent)
    searcher: SearchObjectComponent<DeviceModel>;
}
