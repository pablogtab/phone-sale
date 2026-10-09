import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { IconComponent } from '@/app/shared/ui/icon/icon.component';
import { SearchTermComponent } from '@/app/shared/ui/search-term/search-term.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { HasPermissionDirective } from '@/app/shared/directives/has-permission.directive';
import { Product } from '@/app/core/models/product';
import { ProductService } from '@/app/core/api/product.service';
import { environment } from '@/environments';
import { Dialog } from '@angular/cdk/dialog';
import { CdkMenuModule } from '@angular/cdk/menu';
import { Component, inject } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { finalize, Observable } from 'rxjs';

import { EditProductComponent } from './edit-product/edit-product.component';
import { MessagesService } from '@/app/core/api/messages.service';

@Component({
    selector: 'app-products',
    imports: [
        SharedModule,
        HasPermissionDirective,
        ButtonModule,
        IconComponent,
        CdkMenuModule,
        SearchTermComponent,
    ],
    templateUrl: './products.component.html',
    styleUrl: './products.component.css',
})
export class ProductsComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    private messages = inject(MessagesService);
    private dialog = inject(Dialog);
    private productService = inject(ProductService);
    filesUrl = environment.filesUrl;
    products$: Observable<Product[]>;
    loadingProducts: boolean = true;

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts() {
        this.loadingProducts = true;
        this.products$ = this.productService.search('unique=false').pipe(
            finalize(() => {
                this.loadingProducts = false;
            }),
        );
    }

    newProduct() {
        const data: EditProductDialogParams = {
            title: 'Nuevo Producto',
        };

        this.dialog
            .open(EditProductComponent, { data })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => {
                this.loadProducts();
            });
    }

    editProduct(product: Product) {
        const data: EditProductDialogParams = {
            title: 'Editar Producto',
            productId: product.id,
        };
        this.dialog
            .open(EditProductComponent, { data })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => {
                this.loadProducts();
            });
    }

    async deleteProduct(product: Product) {
        const rta = await this.messages.question(
            '¿Está seguro de eliminar el producto?',
        );
        if (!rta) return;
        this.productService
            .delete(product.id)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.loadProducts();
            });
    }
}

export interface EditProductDialogParams {
    title: string;
    productId?: number;
}
