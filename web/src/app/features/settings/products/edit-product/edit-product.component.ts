import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

import { EditProductDialogParams } from '../products.component';
import {
    CreateProductDto,
    ProductService,
} from '@/app/core/api/product.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { ButtonModule } from '@openng/optimus-ui/button';

@Component({
    selector: 'app-edit-product',
    imports: [SharedModule, InputTextModule, InputNumberModule, ButtonModule],
    templateUrl: './edit-product.component.html',
    styleUrl: './edit-product.component.css',
})
export class EditProductComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    messages = inject(MessagesService);
    dialogRef = inject(DialogRef);
    data: EditProductDialogParams = inject(DIALOG_DATA);

    productService = inject(ProductService);

    form = new FormGroup({
        description: new FormControl(''),
        stock: new FormControl(0),
        sellingPrice: new FormControl(0),
        costPrice: new FormControl(0),
    });

    ngOnInit() {
        if (this.data.productId)
            this.productService
                .get(this.data.productId)
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe((product) => {
                    this.form.patchValue(product);
                });
    }

    async save() {
        const product = this.validateProduct();
        if (!product) return;

        const rta = await this.messages.question(
            '¿Está seguro de guardar los cambios?',
        );

        if (!rta) return;

        if (!this.data.productId) {
            this.productService
                .create(product)
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe(
                    () => {
                        this.messages.success('Producto creado correctamente');
                        this.dialogRef.close();
                    },
                    (error) => {
                        this.messages.showPublicError(
                            error,
                            'Error al crear el producto',
                        );
                    },
                );
        } else {
            this.productService
                .edit(product, this.data.productId)
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe(
                    () => {
                        this.messages.success(
                            'Producto actualizado correctamente',
                        );
                        this.dialogRef.close();
                    },
                    (error) => {
                        this.messages.showPublicError(
                            error,
                            'Error al actualizar el producto',
                        );
                    },
                );
        }
    }

    validateProduct(): CreateProductDto {
        const formValue = this.form.getRawValue();

        if (!formValue.description) {
            this.messages.error('La descripción es requerida');
            return null;
        }

        return {
            description: formValue.description,
            stock: formValue.stock,
            sellingPrice: formValue.sellingPrice,
            costPrice: formValue.costPrice,
        };
    }
}
