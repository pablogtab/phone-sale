import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { FilterService } from '@/app/core/api/filter.service';

/**
 * @param previousRoute: string
 * @param previousRouteName: string
 * @param title: string
 */
@Component({
    selector: 'go-back',
    imports: [IconComponent],
    templateUrl: './go-back.component.html',
    styleUrl: './go-back.component.css',
})
export class GoBackComponent {
    @Input() previousRoute: string;
    @Input() previousRouteName: string;

    @Input() title: string;

    constructor(
        private router: Router,
        private filterService: FilterService<any>,
    ) {}

    goBack() {
        const params = this.filterService.getParamsFromUrl();
        this.router.navigate([this.previousRoute], { queryParams: params });
    }
}
