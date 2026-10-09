import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import {
    GridComponent,
    GridConfig,
    GridDataSource,
} from '@/app/shared/ui/grid/grid.component';
import { ClientSearchComponent } from '@/app/shared/ui/searchers/client-search.component';
import { ProductSearchComponent } from '@/app/shared/ui/searchers/product-search.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { User } from '@/app/core/models/user';
import { Client } from '@/app/core/models/client';
import { CURRENCIES } from '@/app/core/models/currency';
import { Order, ORDER_PAYMENT_METHODS } from '@/app/core/models/order';
import { Product } from '@/app/core/models/product';
import { DeviceAndFile, DeviceService } from '@/app/core/api/device.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { OrderAndDetails, OrdersService } from '@/app/core/api/orders.service';
import { ParameterService } from '@/app/core/api/parameter.service';
import { collapsableOpen } from '@/app/core/utils/animations/collapsable-open.animation';
import { BalanceColorDirective } from '@/app/core/utils/balance-color.directive';
import { rounding } from '@/app/core/utils/rounding';
import { environment } from '@/environments';
import { Dialog } from '@angular/cdk/dialog';
import { Component, inject, Input, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';

import {
    NewOrderPaymentComponent,
    NewOrderPaymentParams,
    OrderPaymentDto,
} from './new-order-payment/new-order-payment.component';
import { UserSearchComponent } from '@/app/shared/ui/searchers/user-search.component';
import { UserService } from '@/app/core/api/user.service';
import { ProductService } from '@/app/core/api/product.service';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { DeviceModelService } from '@/app/core/api/device-model.service';
import { RecommendedAccesoriesComponent } from './recommended-accesories/recommended-accesories.component';

@Component({
    selector: 'app-edit-order',
    imports: [
        ClientSearchComponent,
        ProductSearchComponent,
        UserSearchComponent,
        SharedModule,
        GridComponent,
        BalanceColorDirective,
        InputNumberModule,
    ],
    animations: [collapsableOpen],
    templateUrl: './edit-order.component.html',
    styleUrl: './edit-order.component.css',
})
export class EditOrderComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    @ViewChild(ClientSearchComponent) clientSearcher: ClientSearchComponent;
    @ViewChild(ProductSearchComponent) productSearcher: ProductSearchComponent;
    @ViewChild(UserSearchComponent) userSearcher: UserSearchComponent;
    @ViewChild('accesorySearch') accesorySearch: ProductSearchComponent;

    baseFileUrl = environment.filesUrl;
    message = inject(MessagesService);
    parameters = inject(ParameterService);
    userService = inject(UserService);
    ordersService = inject(OrdersService);
    deviceService = inject(DeviceService);
    deviceModelService = inject(DeviceModelService);
    productService = inject(ProductService);
    router = inject(Router);
    dialog = inject(Dialog);
    order$: Observable<OrderAndDetails>;
    isEditing: boolean = false;
    order: Order = null;
    roundingsAccountId: number;
    loading = signal(false);

    recommendedAccesories: Product[] = [];

    @Input() set orderPublicId(orderPublicId: string) {
        if (!orderPublicId) return;
        this.order$ = this.ordersService.getOrderByPublic(orderPublicId);
    }

    title: string = 'Nueva orden';

    products = new GridDataSource<IOrderItem>();
    payments = new GridDataSource<IPayment>();

    orderItemGridConfig: GridConfig<IOrderItem> = {
        columns: [
            {
                name: 'Producto',
                field: 'description',
                img: { imgGetUrl: (row) => row.device?.mainPhotoUrl },
            },
            { name: 'Precio USD', field: 'priceUSD', pipe: 'currency' },
            { name: 'Precio ARS', field: 'priceARS', pipe: 'currency' },
            { name: 'Cantidad', field: 'quantity' },
            {
                name: 'Total USD',
                get: (row) => row.priceUSD * row.quantity,
                pipe: 'currency',
            },
            {
                name: 'Total ARS',
                get: (row) => row.priceARS * row.quantity,
                pipe: 'currency',
            },
        ],
        actions: [
            {
                eventName: 'delete',
                icon: 'trash',
                label: 'Eliminar',
                disabled: (row) => row.device?.status === 'reserved',
            },
        ],
    };

    paymentsGridConfig: GridConfig<IPayment> = {
        columns: [
            { name: 'Descripción', field: 'description' },
            {
                name: 'Tipo de pago',
                get: (row) =>
                    `${ORDER_PAYMENT_METHODS[row.method]}${row.method !== 'device' ? ` (${CURRENCIES[row.currency]})` : ''}`,
            },
            { name: 'Cotización', field: 'exchangeRate', pipe: 'currency' },
            { name: 'Monto USD', field: 'amountUSD', pipe: 'currency' },
            { name: 'Monto ARS', field: 'amountARS', pipe: 'currency' },
        ],
        actions: [
            {
                eventName: 'delete',
                icon: 'trash',
                label: 'Eliminar',
                disabled: (row) => !!row.transactionId,
            },
        ],
    };

    form = new FormGroup({
        client: new FormControl<Client>(null),
        exchangeRate: new FormControl<number>(0),
        product: new FormControl<Product>(null),
        accesory: new FormControl<Product>(null),
        quantity: new FormControl<number>(1),
        priceUSD: new FormControl<number>(0),
        priceARS: new FormControl<number>(0),
        type: new FormControl<'sale' | 'faceid' | 'wholesale'>('sale'),
        deliveredByUser: new FormControl<User>(null),
    });

    ngOnInit(): void {
        this.form.controls.priceARS.disable();
    }

    ngAfterViewInit(): void {
        this.parameters
            .getParameter('dolar_hoy_cba_price')
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((data) =>
                this.form.controls.exchangeRate.setValue(data.valueN),
            );

        this.form.controls.product.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((product) => {
                if (!product) {
                    this.form.controls.quantity.enable();
                    return this.form.controls.priceUSD.setValue(0);
                }
                this.form.controls.quantity.setValue(1);
                this.form.controls.accesory.setValue(null);
                this.form.controls.quantity.disable();
                this.findProductPrice(product);
            });

        this.form.controls.accesory.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((accesory) => {
                if (!accesory) return;
                this.form.controls.quantity.setValue(1);
                this.form.controls.quantity.enable();
                this.form.controls.product.setValue(null);
                this.findProductPrice(accesory);
            });
        this.form.controls.exchangeRate.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((rate) => {
                this.form.controls.priceARS.setValue(
                    rounding(this.form.controls.priceUSD.value * rate),
                );
            });
        this.form.controls.priceUSD.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((priceUSD) => {
                this.form.controls.priceARS.setValue(
                    priceUSD * (this.form.controls.exchangeRate.value ?? 0),
                );
            });

        this.productSearcher.searcher.setExtraParam('availableOnly', true);
        this.order$
            ?.pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(this.loadOrder.bind(this));

        this.form.controls.type.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(async (type) => {
                const wholesaler = type === 'wholesale';
                if (
                    wholesaler &&
                    this.form.controls.client.value &&
                    !this.form.controls.client.value?.wholesaler
                ) {
                    const rta = await this.message.question(
                        'El cliente seleccionado no es mayorista, ¿desea continuar? (Se limpiará el cliente seleccionado)',
                    );
                    if (!rta)
                        return this.form.controls.type.setValue('sale', {
                            emitEvent: false,
                        });

                    this.form.controls.client.setValue(null);
                }
                this.clientSearcher.searcher.setExtraParam(
                    'wholesaler',
                    wholesaler ? true : undefined,
                );
            });

        this.parameters
            .getParameter('order_roundings_account_id')
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((data) => (this.roundingsAccountId = data.valueN));

        if (!this.order$) {
            this.userService
                .getMyUser()
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe((user) => {
                    this.form.controls.deliveredByUser.setValue(user);
                });
        }
    }

    loadOrder(order: OrderAndDetails) {
        if (!order) return;
        this.order = order;
        this.isEditing = true;
        this.title = 'Editar orden';
        this.clientSearcher.searcher.findById(order.client.publicId);
        this.form.controls.client.disable();
        this.form.controls.exchangeRate.setValue(order.exchangeRate);
        this.form.controls.type.setValue(order.type);
        this.form.controls.type.disable();
        this.products.array = order.items.map((i) => ({
            ...i.product,
            priceARS: i.priceARS,
            priceUSD: i.priceUSD,
            quantity: i.quantity,
            orderItemId: i.id,
        }));
        this.payments.array = order.payments.map((p) => {
            return {
                ...p,
                type: p.method,
                currency: 'usd',
                device: p.device,
                description: p.description,
                isDeposit: p.isDeposit,
                transactionId: p.transactionId,
            };
        });
        if (this.order.deliveredByUserId) {
            this.userSearcher.searcher.findById(this.order.deliveredByUserId);
        }

        if (
            this.order.status === 'cancelled' ||
            this.order.status === 'confirmed'
        ) {
            this.form.disable();
        }
    }

    async findProductPrice(product: Product) {
        const price = await firstValueFrom(
            this.productService.price(
                product.id,
                this.form.controls.type.value,
            ),
        );
        if (!price) return;

        this.form.controls.priceUSD.setValue(price.price);
    }

    addProduct() {
        const valid = this.validateProduct();
        if (!valid) return;

        const product =
            this.form.controls.product.value ||
            this.form.controls.accesory.value;

        this.products.push({
            ...product,
            priceUSD: this.form.controls.priceUSD.value,
            priceARS: this.form.controls.priceARS.value,
            quantity: this.form.controls.quantity.value,
        });

        if (product.deviceId) {
            this.deviceService
                .get(product.deviceId)
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe((device) => {
                    if (device) {
                        this.products.array[this.products.length - 1].device =
                            device;
                    }
                    this.getDeviceRecommendedAccesories(device.modelId);
                });
        }

        this.resetProductSelection();
    }

    async getDeviceRecommendedAccesories(modelId: number) {
        const model = await firstValueFrom(
            this.deviceModelService.get(modelId),
        );
        if (
            !model ||
            !model.recommendedAccesories ||
            !model.recommendedAccesories.length
        )
            return;
        const accesories = model.recommendedAccesories;

        this.dialog
            .open<(Product & { quantity: number })[]>(
                RecommendedAccesoriesComponent,
                { data: { accesories } },
            )
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe((data: (Product & { quantity: number })[]) => {
                if (!data) return;
                this.products.array = [
                    ...this.products.array,
                    ...data.map((x) => {
                        const priceUSD = rounding(x.sellingPrice);
                        const priceARS = rounding(
                            priceUSD * this.form.controls.exchangeRate.value,
                        );
                        return { ...x, priceUSD, priceARS };
                    }),
                ];
            });
    }

    newPayment() {
        this.dialog
            .open<OrderPaymentDto, NewOrderPaymentParams>(
                NewOrderPaymentComponent,
                {
                    data: {
                        exchangeRate: this.form.controls.exchangeRate.value,
                        amountUSD: this.balanceUSD,
                        currency: 'usd',
                    },
                },
            )
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe((res) => {
                if (res) {
                    this.payments.push(res);
                }
            });
    }

    newCashback() {
        this.dialog
            .open<OrderPaymentDto, NewOrderPaymentParams>(
                NewOrderPaymentComponent,
                {
                    data: {
                        exchangeRate: this.form.controls.exchangeRate.value,
                        amountUSD: -this.balanceUSD,
                        currency: 'ars',
                        cashback: true,
                    },
                },
            )
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe((res) => {
                if (res) {
                    this.payments.push(res);
                }
            });
    }

    validateProduct() {
        if (
            !this.form.controls.product.value &&
            !this.form.controls.accesory.value
        ) {
            this.message.error('Debe seleccionar un producto');
            return false;
        }

        if (
            !Number.isInteger(this.form.controls.quantity.value) ||
            this.form.controls.quantity.value <= 0 ||
            !Number.isFinite(this.form.controls.priceUSD.value) ||
            this.form.controls.priceUSD.value <= 0
        ) {
            this.message.error(
                'La cantidad y el precio deben ser mayores a cero',
            );
            return false;
        }
        const id =
            this.form.controls.product.value?.id ??
            this.form.controls.accesory.value?.id;

        if (this.products.array.find((p) => p.id === id)) {
            this.message.error('El producto ya fue agregado');
            return false;
        }

        return true;
    }

    resetProductSelection() {
        this.form.controls.accesory.reset(null, { emitEvent: false });
        this.form.controls.product.reset(null, { emitEvent: false });
        this.form.controls.priceUSD.reset(0, { emitEvent: false });
        this.form.controls.priceARS.reset(0, { emitEvent: false });
    }

    removeProduct(index: number) {
        this.products.remove(index, 1);
    }

    orderItemsGridAction(event: {
        event: string;
        row: IOrderItem;
        index: number;
    }) {
        switch (event.event) {
            case 'delete':
                this.removeProduct(event.index);
                break;
        }
    }

    paymentGridAction(event: { event: string; row: IPayment; index: number }) {
        switch (event.event) {
            case 'delete':
                this.payments.remove(event.index, 1);
                break;
        }
    }

    async saveCredit() {
        const msg = this.payments.length
            ? `El pago a cuenta corriente no incluirá los pagos cargados, ¿desea continuar?`
            : `¿Desea guardar la orden como pago a cuenta corriente?`;

        const rta = await this.message.question(msg);
        if (!rta) return;

        this.saveOrder(true);
    }

    async saveOrder(credit: boolean = false) {
        if (this.loading() || this.form.disabled) return;
        const isValid = this.validateOrder(credit);
        if (!isValid) return;

        this.loading.set(true);
        if (!credit) {
            const msg = `¿Está seguro de continuar?`;
            const rta = await this.message.question(msg);
            if (!rta) {
                this.loading.set(false);
                return;
            }
        }

        const order = {
            clientId: this.form.controls.client.value.id,
            exchangeRate: this.form.controls.exchangeRate.value,
            products: this.products.array
                .filter((p) => !p.orderItemId)
                .map((p) => ({
                    productId: p.id,
                    priceUSD: p.priceUSD,
                    priceARS: p.priceARS,
                    quantity: p.quantity,
                    exchangeRate: rounding(p.priceARS / p.priceUSD),
                })),
            credit,
            type: this.form.controls.type.value,
            payments: !credit
                ? this.payments.array.filter((p) => !p.transactionId)
                : [],
            deliveredByUserId: this.form.controls.deliveredByUser.value?.id,
        };

        this.loading.set(true);
        if (!this.isEditing) {
            this.ordersService
                .createOrder(order)
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe({
                    next: (data) => {
                        this.message.success('Orden creada correctamente');
                        this.router.navigate(['/orders/order', data.publicId]);
                    },
                    error: (err) => {
                        this.message.showPublicError(err);
                        this.loading.set(false);
                    },
                });
        } else {
            this.ordersService
                .continueOrder(this.order?.publicId, order)
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe({
                    next: (data) => {
                        this.message.success('Orden actualizada correctamente');
                        this.router.navigate(['/orders/order', data.publicId]);
                    },
                    error: (err) => {
                        this.message.showPublicError(err);
                        this.loading.set(false);
                    },
                });
        }
    }

    validateOrder(credit: boolean) {
        if (!this.form.controls.client.value) {
            this.message.error('Debe seleccionar un cliente');
            return false;
        }

        if (this.products.length === 0) {
            this.message.error('Debe agregar al menos un producto');
            return false;
        }

        if (
            this.balanceUSD === 0 &&
            !this.form.controls.deliveredByUser.value
        ) {
            this.message.error('Debe seleccionar quien entrega el equipo');
            return false;
        }

        return true;
    }

    rounding() {
        this.payments.push({
            amountARS: rounding(
                this.balanceUSD * this.form.controls.exchangeRate.value,
            ),
            amountUSD: this.balanceUSD,
            currency: 'usd',
            description: 'Redondeo',
            exchangeRate: this.form.controls.exchangeRate.value,
            method: 'cash',
            cashAccountId: this.roundingsAccountId,
        });
    }

    get disabledSave() {
        return (
            (this.isEditing ? this.balanceUSD !== 0 : !this.products.length) ||
            this.loading() ||
            this.form.disabled
        );
    }

    get totalUSD() {
        return rounding(
            this.products.array.reduce(
                (acc, p) => acc + p.priceUSD * p.quantity,
                0,
            ),
        );
    }

    get totalARS() {
        return rounding(
            this.products.array.reduce(
                (acc, p) => acc + p.priceARS * p.quantity,
                0,
            ),
        );
    }

    get balanceUSD() {
        return rounding(
            this.totalUSD -
                this.payments?.array.reduce((acc, p) => acc + p.amountUSD, 0),
        );
    }

    get enableRounding() {
        return (
            this.balanceUSD !== 0 &&
            this.payments.array.length > 0 &&
            Math.abs(this.balanceUSD) < 5
        );
    }

    get isDepositing() {
        return (
            this.balanceUSD > 0 && this.payments.array.length > 0 && !this.order
        );
    }
}

interface IOrderItem extends Product {
    device?: DeviceAndFile;
    priceUSD: number;
    priceARS: number;
    quantity: number;
    orderItemId?: number;
}

interface IPayment extends OrderPaymentDto {
    isDeposit?: boolean;
    transactionId?: number;
}
