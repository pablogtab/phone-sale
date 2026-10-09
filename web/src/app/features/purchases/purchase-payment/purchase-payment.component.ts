import { BankSearchComponent } from '@/app/shared/ui/searchers/bank-search.component';
import { CashAccountsSearchComponent } from '@/app/shared/ui/searchers/cash-accounts-search.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { Bank } from '@/app/core/models/bank';
import { CashAccount } from '@/app/core/models/cash-account';
import { CURRENCIES, Currency } from '@/app/core/models/currency';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { SelectModule } from '@openng/optimus-ui/select';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';

export type PurchasePaymentType = 'credit' | 'cash' | 'bank';

@Component({
    selector: 'app-purchase-payment',
    imports: [
        SharedModule,
        SelectModule,
        BankSearchComponent,
        CashAccountsSearchComponent,
        SelectButtonModule,
        InputNumberModule,
        ButtonModule,
    ],
    templateUrl: './purchase-payment.component.html',
})
export class PurchasePaymentComponent {
    data: PurchasePaymentDialogParams = inject(DIALOG_DATA);
    dialogRef = inject(DialogRef);

    form = new FormGroup({
        type: new FormControl<PurchasePaymentType>('credit'),
        currency: new FormControl<Currency>('usd'),
        amount: new FormControl<number>(0),
        exchangeRate: new FormControl<number>(1),
        reference: new FormControl<string>(''),
        bank: new FormControl<Bank>(null),
        cashAccount: new FormControl<CashAccount>(null),
    });
    paymentTypes = [
        { value: 'credit', label: 'Cuenta Corriente' },
        { value: 'cash', label: 'Caja' },
        { value: 'bank', label: 'Transferencia Bancaria' },
    ];
    currencies = [
        { label: 'ARS', currency: 'ars' },
        { label: 'USD', currency: 'usd' },
    ];

    onFocus(event: any): void {
        const el = event.srcElement;
        el.select();
    }

    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        this.form.controls.amount.setValue(this.data.amount);
    }

    get buttonEnabled(): boolean {
        const { type, amount, bank, cashAccount } = this.form.value;
        if (!Number.isFinite(amount) || amount <= 0 || !['credit', 'cash', 'bank'].includes(type) || !['ars', 'usd'].includes(this.form.value.currency)) return false;
        if (type === 'cash') {
            if (!cashAccount) return false;
        }
        if (type === 'bank') {
            if (!bank) return false;
        }
        return true;
    }

    save() {
        if (!this.buttonEnabled) return;
        const { amount, type } = this.form.value;
        const payment: PurchasePayment = {
            amount,
            type,
            bankId: type === 'bank' ? this.form.value.bank?.id : null,
            cashAccountId:
                type === 'cash' ? this.form.value.cashAccount?.id : null,
            description: this.getDescription(),
            currency: this.form.value.currency,
        };
        this.dialogRef.close(payment);
    }

    getDescription(): string {
        const { type, bank, cashAccount, currency } = this.form.value;

        const currencyLabel = currency === 'usd' ? 'USD' : 'ARS';

        if (type === 'cash')
            return `Caja -> ${cashAccount.name} (${currencyLabel})`;
        if (type === 'bank') return `Banco -> ${bank.name} (${currencyLabel})`;
        return 'Cuenta Corriente';
    }
}

export interface PurchasePaymentDialogParams {
    amount: number;
}

export interface PurchasePayment {
    amount: number;
    type: PurchasePaymentType;
    bankId?: number;
    cashAccountId?: number;
    description: string;
    currency: Currency;
}
