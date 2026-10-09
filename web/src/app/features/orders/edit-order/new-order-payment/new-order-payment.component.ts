import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { FastAddDeviceComponent } from '@/app/shared/ui/fast-add-device/fast-add-device.component';
import { BankSearchComponent } from '@/app/shared/ui/searchers/bank-search.component';
import { UserSearchComponent } from '@/app/shared/ui/searchers/user-search.component';
import { SelectableConfig } from '@/app/shared/ui/selectable/selectable.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { Bank } from '@/app/core/models/bank';
import { CashAccount } from '@/app/core/models/cash-account';
import { CURRENCIES, Currency } from '@/app/core/models/currency';
import {
    ORDER_PAYMENT_METHODS,
    OrderPaymentMethod,
} from '@/app/core/models/order';
import { Provider } from '@/app/core/models/provider';
import { User } from '@/app/core/models/user';
import { CreateDeviceDto } from '@/app/core/api/device.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { rounding } from '@/app/core/utils/rounding';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CashAccountsSearchComponent } from '@/app/shared/ui/searchers/cash-accounts-search.component';
import { ProviderSearchComponent } from '@/app/shared/ui/searchers/provider-search.component';

type AvailableTransferTypes = 'bank' | 'provider' | 'user';

const TRANSFER_TYPES = {
    bank: 'Banco',
    provider: 'Proveedor',
    user: 'Usuario',
} as const;

@Component({
    selector: 'app-new-order-payment',
    imports: [
        SharedModule,
        CashAccountsSearchComponent,
        FastAddDeviceComponent,
        BankSearchComponent,
        ProviderSearchComponent,
        UserSearchComponent,
    ],
    templateUrl: './new-order-payment.component.html',
})
export class NewOrderPaymentComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    data: NewOrderPaymentParams = inject(DIALOG_DATA);
    message = inject(MessagesService);
    dialogRef = inject(DialogRef);

    paymentTypes = Object.keys(ORDER_PAYMENT_METHODS) as OrderPaymentMethod[];
    currencies = Object.entries(CURRENCIES);
    transferTypes = Object.keys(TRANSFER_TYPES) as AvailableTransferTypes[];

    selectableConfigPaymentTypes: SelectableConfig<OrderPaymentMethod> = {
        parseLabel: (type) => ORDER_PAYMENT_METHODS[type],
    };

    selectableConfigTransferTypes: SelectableConfig<AvailableTransferTypes> = {
        parseLabel: (type) => TRANSFER_TYPES[type],
    };

    form = new FormGroup({
        paymentType: new FormControl<OrderPaymentMethod>(null),
        currency: new FormControl<Currency>('usd'),
        exchangeRate: new FormControl<number>(0),
        amountARS: new FormControl<number>(0),
        amountUSD: new FormControl<number>(0),
        transferAccountType: new FormControl<AvailableTransferTypes>(null),
        cashAccount: new FormControl<CashAccount>(null),
        bank: new FormControl<Bank>(null),
        provider: new FormControl<Provider>(null),
        user: new FormControl<User>(null),
        test: new FormControl<string>('sale'),
    });

    @ViewChild(CashAccountsSearchComponent, { static: false })
    cashAccountsSearch!: CashAccountsSearchComponent;
    @ViewChild(FastAddDeviceComponent, { static: false })
    fastAddDevice!: FastAddDeviceComponent;

    ngAfterViewInit(): void {
        this.form.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((val) => {
                if (val.currency === 'ars') {
                    this.form.get('amountUSD').disable({ emitEvent: false });
                    this.form.get('amountARS').enable({ emitEvent: false });
                } else if (val.currency === 'usd') {
                    this.form.get('amountARS').disable({ emitEvent: false });
                    this.form.get('amountUSD').enable({ emitEvent: false });
                } else {
                    this.form.get('amountARS').disable({ emitEvent: false });
                    this.form.get('amountUSD').disable({ emitEvent: false });
                }
            });

        this.form.controls.amountARS.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((val) => {
                if (this.form.controls.currency.value === 'ars') {
                    this.form.controls.amountUSD.setValue(
                        rounding(val / this.form.controls.exchangeRate.value),
                    );
                }
            });

        this.form.controls.amountUSD.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((val) => {
                if (this.form.controls.currency.value === 'usd') {
                    this.form.controls.amountARS.setValue(
                        rounding(val * this.form.controls.exchangeRate.value),
                    );
                }
            });

        this.form.controls.currency.setValue(this.data.currency);
        this.form.controls.exchangeRate.setValue(this.data.exchangeRate ?? 1);
        this.form.controls.amountUSD.setValue(this.data.amountUSD);
        if (this.data.cashback) {
            this.paymentTypes = this.paymentTypes.filter(
                (type) => type !== 'device',
            );
        }
    }

    async save() {
        if (!this.isValidForm()) {
            return;
        }
        const payment = this.getPayment();

        if (payment.method === 'bank_transfer' && payment.currency === 'usd') {
            if (
                !(await this.message.question(
                    '¿Está seguro que desea realizar una transferencia en dólares?',
                ))
            ) {
                return;
            }
        }

        this.dialogRef.close(payment);
    }

    isValidForm() {
        const value = this.form.getRawValue();
        if (
            !this.paymentTypes.includes(value.paymentType) ||
            !['ars', 'usd'].includes(value.currency) ||
            !Number.isFinite(value.exchangeRate) ||
            value.exchangeRate <= 0
        )
            return false;
        const amount =
            value.currency === 'ars' ? value.amountARS : value.amountUSD;
        if (!Number.isFinite(amount) || amount <= 0) return false;
        let customValidation: boolean;

        switch (this.form.controls.paymentType.value) {
            case 'device':
                customValidation = this.isValidDevice();
                break;
            case 'cash':
                customValidation = this.isValidCashAccount();
                break;
            default:
                customValidation = this.isValidTransferDestination();
                break;
        }

        let generalValidation = true;

        if (this.form.controls.currency.value === 'ars') {
            generalValidation = !!this.form.controls.amountARS.value;
        } else {
            generalValidation = !!this.form.controls.amountUSD.value;
        }

        if (!generalValidation) {
            return false;
        }

        return customValidation;
    }

    getPayment(): OrderPaymentDto {
        return {
            method: this.form.controls.paymentType.value,
            currency: this.form.controls.currency.value,
            exchangeRate: this.form.controls.exchangeRate.value,
            amountARS: rounding(
                this.form.controls.amountARS.value *
                    (this.data.cashback ? -1 : 1),
            ),
            amountUSD: rounding(
                this.form.controls.amountUSD.value *
                    (this.data.cashback ? -1 : 1),
            ),
            description: this.parseReference(),
            ...this.aditionalData(),
        };
    }

    aditionalData() {
        switch (this.form.controls.paymentType.value) {
            case 'device':
                return { device: this.fastAddDevice.createDevice };
            case 'cash':
                return {
                    cashAccountId: this.form.controls.cashAccount.value.id,
                };
            default:
                return {
                    providerId: this.form.controls.provider.value?.id,
                    bankId: this.form.controls.bank.value?.id,
                    userId: this.form.controls.user.value?.id,
                };
        }
    }

    parseReference() {
        let reference = this.data.cashback ? 'Devolución -> ' : '';
        switch (this.form.controls.paymentType.value) {
            case 'device':
                return (
                    reference +
                    `Entrega equipo: ${this.fastAddDevice.parsedLabel}`
                );
            case 'cash':
                return (
                    reference +
                    `Caja: ${this.form.controls.cashAccount.value.name}`
                );
            default:
                return (
                    reference +
                    `Transferencia a ${this.parseTransferDestination()}`
                );
        }
    }

    isValidDevice() {
        const isValid = this.fastAddDevice?.isValid();
        return !!isValid;
    }

    isValidCashAccount() {
        return !!this.form.controls.cashAccount.value;
    }

    isValidTransferDestination() {
        const transferType = this.form.controls.transferAccountType.value;
        return (
            (transferType === 'bank' && !!this.form.controls.bank.value) ||
            (transferType === 'provider' &&
                !!this.form.controls.provider.value) ||
            (transferType === 'user' && !!this.form.controls.user.value)
        );
    }

    parseTransferDestination() {
        const transferType = this.form.controls.transferAccountType.value;
        switch (transferType) {
            case 'bank':
                return `Banco: ${this.form.controls.bank.value.name}`;
            case 'provider':
                return `Proveedor: ${this.form.controls.provider.value.name}`;
            case 'user':
                return `Usuario: ${this.form.controls.user.value.name}`;
            default:
                return '';
        }
    }
}

export interface OrderPaymentDto {
    method: OrderPaymentMethod;
    currency: Currency;
    exchangeRate: number;
    amountARS: number;
    amountUSD: number;
    description: string;
    device?: CreateDeviceDto;
    cashAccountId?: number;
    providerId?: number;
    bankId?: number;
    userId?: number;
}

export interface NewOrderPaymentParams {
    exchangeRate: number;
    amountUSD: number;
    cashback?: boolean;
    currency?: Currency;
}
