import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { HostControlDirective } from '@/app/shared/directives/host-control.directive';
import { Product } from '@/app/core/models/product';
import { ProductService } from '@/app/core/api/product.service';
import {
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
    SearchObjectComponent,
    SearchObjectConfig,
} from '../search-object/search-object.component';

type ProductExtraParams = {
    unique: boolean;
    availableOnly: boolean;
};

@Component({
    selector: 'product-search',
    imports: [SearchObjectComponent, ReactiveFormsModule],
    template: `<search-object
        [formControl]="hcd.control"
        [config]="paramsSearcher"
    ></search-object>`,
    hostDirectives: [HostControlDirective],
})
export class ProductSearchComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    @Input() unique: boolean = true;
    @Output() onChange: EventEmitter<Product> = new EventEmitter<Product>();

    hcd = inject(HostControlDirective);

    paramsSearcher: SearchObjectConfig<Product, ProductExtraParams> = {
        displayWith: (model: Product) => model.description,
        service: ProductService,
        extraParams: { unique: true },
    };

    @ViewChild(SearchObjectComponent) searcher: SearchObjectComponent<
        Product,
        ProductExtraParams
    >;

    ngOnInit() {
        this.hcd.control.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((value) => {
                this.onChange.emit(value);
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        if (changes['unique']) {
            this.paramsSearcher.extraParams.unique = this.unique;
        }
    }
}
