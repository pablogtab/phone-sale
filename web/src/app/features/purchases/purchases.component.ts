import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { DeviceColor } from '@/app/core/models/device-color';
import { DeviceModel } from '@/app/core/models/device-model';
import { DeviceStorageSize } from '@/app/core/models/device-storage-size';
import { Product } from '@/app/core/models/product';
import { DeviceModelService } from '@/app/core/api/device-model.service';
import { DevicePriceReferenceService } from '@/app/core/api/device-price-reference.service';
import { ProductService } from '@/app/core/api/product.service';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, of, switchMap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { ChipModule } from '@openng/optimus-ui/chip';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';

import { DeviceModelSearchComponent } from '../../shared/ui/searchers/device-model-search.component';
import { ProductSearchComponent } from '../../shared/ui/searchers/product-search.component';
import { ProviderSearchComponent } from '../../shared/ui/searchers/provider-search.component';
import { TableModule } from '@openng/optimus-ui/table';
import { rounding } from '@/app/core/utils/rounding';
import { Dialog } from '@angular/cdk/dialog';
import {
    PurchasePayment,
    PurchasePaymentComponent,
    PurchasePaymentDialogParams,
    PurchasePaymentType,
} from './purchase-payment/purchase-payment.component';
import { MessagesService } from '@/app/core/api/messages.service';
import {
    CreatePurchasePayment,
    CreatePurchaseProduct,
    PurchasesService,
} from '@/app/core/api/purchases.service';
import { Provider } from '@/app/core/models/provider';
import { ParameterService } from '@/app/core/api/parameter.service';

@Component({
    selector: 'app-purchases',
    imports: [
        SharedModule,
        ProviderSearchComponent,
        ProductSearchComponent,
        DeviceModelSearchComponent,
        InputNumberModule,
        ChipModule,
        ButtonModule,
        TableModule,
        ToggleSwitchModule,
    ],
    templateUrl: './purchases.component.html',
    styleUrl: './purchases.component.css',
})
export class PurchasesComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    private readonly destroyRef = inject(DestroyRef);
    readonly saving = signal(false);
    readonly error = signal('');
    readonly success = signal('');

    parameterService = inject(ParameterService);
    purchasesService = inject(PurchasesService);
    message = inject(MessagesService);
    dialog = inject(Dialog);
    modelService = inject(DeviceModelService);
    priceReferenceService = inject(DevicePriceReferenceService);
    productService = inject(ProductService);
    sizes: DeviceStorageSize[] = [];
    colors: DeviceColor[] = [];
    form = new FormGroup({
        provider: new FormControl<Provider>(null),
        model: new FormControl<DeviceModel>(null),
        accesory: new FormControl<Product>(null),
        size: new FormControl<DeviceStorageSize>(null),
        color: new FormControl<DeviceColor>(null),
        quantity: new FormControl<number>(1),
        price: new FormControl<number>(0),
        exchangeRate: new FormControl<number>(0),
        transit: new FormControl<boolean>(true),
    });

    payments: (PurchasePayment & { amountARS: number; amountUSD: number })[] =
        [];
    rows: ITableRow[] = [];

    ngAfterViewInit(): void {
        this.form.controls.model.valueChanges
            .pipe(
                switchMap((model) => {
                    this.clearModel();
                    this.form.patchValue(
                        { size: null, color: null, price: 0 },
                        { emitEvent: false },
                    );
                    if (!model || typeof model === 'string') return of(null);
                    this.form.controls.accesory.setValue(null, {
                        emitEvent: false,
                    });
                    return this.modelService.get(model.id).pipe(
                        catchError(() => {
                            this.error.set(
                                'No pudimos cargar las variantes del modelo. Volvé a seleccionarlo.',
                            );
                            return of(null);
                        }),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((model) => {
                if (!model) return;
                this.sizes = model.availableStorageSizes;
                this.colors = model.availableColors;
                this.form.controls.color.setValue(this.colors[0] || null);
                this.form.controls.size.setValue(this.sizes[0] || null);
            });
        this.form.controls.accesory.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((product) => {
                if (!product || typeof product === 'string') return;
                this.form.controls.model.setValue(null);
                this.form.controls.price.setValue(product.costPrice || 0);
            });
        this.form.controls.size.valueChanges
            .pipe(
                switchMap((size) => {
                    const model = this.form.controls.model.value;
                    return model?.id && size?.id
                        ? this.priceReferenceService
                              .find(model.id, size.id, false)
                              .pipe(catchError(() => of(null)))
                        : of(null);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((price) =>
                this.form.controls.price.setValue(price?.purchasePrice || 0),
            );
        this.form.controls.exchangeRate.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => this.recalculatePayments());
        this.parameterService
            .getParameter('dolar_hoy_cba_price')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: (parameter) =>
                    this.form.controls.exchangeRate.setValue(
                        parameter.valueN || 0,
                    ),
                error: () =>
                    this.error.set(
                        'No pudimos cargar la cotización. Podés ingresarla manualmente.',
                    ),
            });
    }

    recalculatePayments() {
        const rate = this.form.controls.exchangeRate.value;
        this.payments = this.payments.map((payment) => ({
            ...payment,
            amountUSD:
                payment.currency === 'usd'
                    ? payment.amount
                    : rate > 0
                      ? rounding(payment.amount / rate)
                      : 0,
            amountARS:
                payment.currency === 'ars'
                    ? payment.amount
                    : rounding(payment.amount * rate),
        }));
    }

    clearModel() {
        this.sizes = [];
        this.colors = [];
    }

    onSelectedColor(color: DeviceColor) {
        this.form.controls.color.setValue(color);
    }

    onSelectedStorage(size: DeviceStorageSize) {
        this.form.controls.size.setValue(size);
    }

    onAdd() {
        if (this.saving()) return;
        const quantity = this.form.controls.quantity.value;
        const price = this.form.controls.price.value;
        if (
            !Number.isInteger(quantity) ||
            quantity <= 0 ||
            price == null ||
            price <= 0
        ) {
            this.error.set(
                'Ingresá una cantidad entera mayor a cero y un precio válido.',
            );
            return;
        }
        this.error.set('');
        this.success.set('');
        const value = this.form.getRawValue();

        if (value.accesory) {
            this.rows.push({
                description: value.accesory.description,
                product: value.accesory,
                quantity: value.quantity,
                price: value.price,
            });
        } else {
            if (!value.model || !value.size || !value.color) return;
            this.rows.push({
                description: `${value.model.name} ${value.size.size} ${value.color.name}`,
                model: value.model,
                size: value.size,
                color: value.color,
                quantity: value.quantity,
                price: value.price,
            });
        }
    }

    newPayment() {
        if (this.saving()) return;
        if (this.form.controls.exchangeRate.value <= 0) {
            this.error.set(
                'Configurá la cotización del dólar antes de agregar pagos.',
            );
            return;
        }
        const data: PurchasePaymentDialogParams = {
            amount: this.balance,
        };

        this.dialog
            .open<PurchasePayment>(PurchasePaymentComponent, { data })
            .closed.pipe(takeUntilDestroyed(this.destroyRef))
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((payment: PurchasePayment) => {
                if (!payment) return;
                const exchangeRate = this.form.controls.exchangeRate.value;
                const amountARS =
                    payment.currency === 'ars'
                        ? payment.amount
                        : rounding(payment.amount * exchangeRate);
                const amountUSD =
                    payment.currency === 'usd'
                        ? payment.amount
                        : rounding(payment.amount / exchangeRate);
                this.payments.push({ ...payment, amountARS, amountUSD });
            });
    }

    deletePayment(index: number) {
        this.payments.splice(index, 1);
    }

    onRowDeleted(index: number) {
        this.rows.splice(index, 1);
    }

    async onSave() {
        if (this.saving()) return;
        const isValid = this.validate();
        if (!isValid) return;

        this.saving.set(true);
        this.error.set('');
        this.success.set('');
        const rta = await this.message.question('¿Desea guardar la compra?');
        if (!rta) {
            this.saving.set(false);
            return;
        }

        const providerId = this.form.controls.provider.value.id;
        const products: CreatePurchaseProduct[] = this.rows.map((row) => {
            if (row.product) {
                return {
                    quantity: row.quantity,
                    price: row.price,
                    productId: row.product.id,
                    type: 'product',
                };
            }

            return {
                quantity: row.quantity,
                price: row.price,
                modelId: row.model.id,
                storageSizeId: row.size.id,
                colorId: row.color.id,
                type: 'device',
            };
        });

        const payments: CreatePurchasePayment[] = this.payments.map(
            (payment) => {
                if (payment.type === 'credit') {
                    return {
                        amount: payment.amount,
                        type: 'credit',
                        currency: payment.currency,
                    };
                }

                if (payment.type === 'cash') {
                    return {
                        amount: payment.amount,
                        type: 'cash',
                        cashAccountId: payment.cashAccountId,
                        currency: payment.currency,
                    };
                }

                return {
                    amount: payment.amount,
                    type: 'bank',
                    bankId: payment.bankId,
                    currency: payment.currency,
                };
            },
        );

        const data = {
            providerId,
            products,
            payments,
            total: this.total,
            exchangeRate: this.form.controls.exchangeRate.value,
            transit: this.form.controls.transit.value,
        };
        this.form.disable({ emitEvent: false });
        this.purchasesService
            .new(data)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => {
                    this.saving.set(false);
                    this.form.enable({ emitEvent: false });
                }),
            )
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: () => {
                    this.rows = [];
                    this.payments = [];
                    this.clearModel();
                    this.form.patchValue(
                        {
                            model: null,
                            accesory: null,
                            size: null,
                            color: null,
                            quantity: 1,
                            price: 0,
                        },
                        { emitEvent: false },
                    );
                    this.success.set(
                        'Compra guardada. El stock y las cuentas ya están actualizados.',
                    );
                },
                error: () =>
                    this.error.set(
                        'No pudimos guardar la compra. Conservamos los ítems y pagos para que puedas volver a intentar.',
                    ),
            });
    }

    validate() {
        if (this.form.controls.exchangeRate.value <= 0) {
            this.error.set('Ingresá una cotización del dólar mayor a cero.');
            return false;
        }
        if (this.rows.length === 0) {
            this.message.error('Debe agregar al menos un producto');
            return false;
        }

        if (this.balance !== 0) {
            this.message.error('El saldo debe ser 0');
            return false;
        }

        if (!this.form.controls.provider.value) {
            this.message.error('Debe seleccionar un proveedor');
            return false;
        }

        return true;
    }

    get itemsQnty() {
        return this.rows.reduce((acc, row) => acc + row.quantity, 0);
    }

    get total() {
        return rounding(
            this.rows.reduce((acc, row) => acc + row.price * row.quantity, 0),
        );
    }

    get balance() {
        return rounding(
            this.total -
                this.payments.reduce(
                    (acc, payment) => acc + payment.amountUSD,
                    0,
                ),
        );
    }

    get disabledSave() {
        return (
            this.saving() ||
            this.rows.length === 0 ||
            this.balance !== 0 ||
            !this.form.controls.provider.value ||
            this.form.controls.exchangeRate.value <= 0
        );
    }
}

interface ITableRow {
    description: string;
    model?: DeviceModel;
    size?: DeviceStorageSize;
    color?: DeviceColor;
    product?: Product;
    quantity: number;
    price: number;
}
