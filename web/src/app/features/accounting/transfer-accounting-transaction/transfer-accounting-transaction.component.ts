import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { SharedModule } from '@/app/shared/ui/shared.module';
import {
    ACCOUNTING_TYPES_CONFIG,
    AccountingAccount,
    AccountingAccountType,
    AccountingConfig,
} from '@/app/core/models/accounting';
import { Bank } from '@/app/core/models/bank';
import { CashAccount } from '@/app/core/models/cash-account';
import { Client } from '@/app/core/models/client';
import { Currency } from '@/app/core/models/currency';
import { User } from '@/app/core/models/user';
import { AccountingService } from '@/app/core/api/accounting.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { ParameterService } from '@/app/core/api/parameter.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, Provider, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
    AutoCompleteCompleteEvent,
    AutoCompleteModule,
} from '@openng/optimus-ui/autocomplete';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';

import { BankSearchComponent } from '../../../shared/ui/searchers/bank-search.component';
import { CashAccountsSearchComponent } from '../../../shared/ui/searchers/cash-accounts-search.component';
import { ClientSearchComponent } from '../../../shared/ui/searchers/client-search.component';
import { ProviderSearchComponent } from '../../../shared/ui/searchers/provider-search.component';
import { UserSearchComponent } from '../../../shared/ui/searchers/user-search.component';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';

@Component({
    selector: 'app-transfer-accounting-transaction',
    imports: [
        SharedModule,
        ReactiveFormsModule,
        ClientSearchComponent,
        UserSearchComponent,
        ProviderSearchComponent,
        BankSearchComponent,
        CashAccountsSearchComponent,
        AutoCompleteModule,
        SelectButtonModule,
        InputNumberModule,
    ],

    templateUrl: './transfer-accounting-transaction.component.html',
})
export class TransferAccountingTransactionComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    messages = inject(MessagesService);
    parameterService = inject(ParameterService);
    accountingService = inject(AccountingService);

    dialogRef = inject(DialogRef);
    data: TransferTransactionParams = inject(DIALOG_DATA);

    exchangeRate = new FormControl<number>(null);
    amountARS = new FormControl<number>(0);
    amountUSD = new FormControl<number>(0);

    currencies = [
        { label: 'ARS', currency: 'ars' },
        { label: 'USD', currency: 'usd' },
    ];

    accountTypes = Object.values(ACCOUNTING_TYPES_CONFIG);

    formA = new FormGroup({
        transferAccountType: new FormControl<AccountingAccountType>(null),
        currency: new FormControl<Currency>('usd'),
        cash_account: new FormControl<CashAccount>(null),
        bank: new FormControl<Bank>(null),
        provider: new FormControl<Provider>(null),
        user: new FormControl<User>(null),
        client: new FormControl<Client>(null),
    });

    formB = new FormGroup({
        transferAccountType: new FormControl<AccountingAccountType>(null),
        currency: new FormControl<Currency>('usd'),
        cash_account: new FormControl<CashAccount>(null),
        bank: new FormControl<Bank>(null),
        provider: new FormControl<Provider>(null),
        user: new FormControl<User>(null),
        client: new FormControl<Client>(null),
    });

    suggestions: AccountingConfig[] = Object.values(ACCOUNTING_TYPES_CONFIG);

    @ViewChild('formAUserSearch') formAUserSearch: UserSearchComponent;
    @ViewChild('formAClientSearch') formAClientSearch: ClientSearchComponent;
    @ViewChild('formAProviderSearch')
    formAProviderSearch: ProviderSearchComponent;
    @ViewChild('formABankSearch') formABankSearch: BankSearchComponent;
    @ViewChild('formACashAccountSearch')
    formACashAccountSearch: CashAccountsSearchComponent;

    @ViewChild('formBUserSearch') formBUserSearch: UserSearchComponent;
    @ViewChild('formBClientSearch') formBClientSearch: ClientSearchComponent;
    @ViewChild('formBProviderSearch')
    formBProviderSearch: ProviderSearchComponent;
    @ViewChild('formBBankSearch') formBBankSearch: BankSearchComponent;
    @ViewChild('formBCashAccountSearch')
    formBCashAccountSearch: CashAccountsSearchComponent;

    ngOnInit(): void {
        this.parameterService
            .getParameter('dolar_hoy_cba_price')
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((param) => {
                this.exchangeRate.setValue(param.valueN);
                // if (this.data.initialAmount) {
                //     this.originAccount.value?.currency === 'usd' ? this.amountUSD.setValue(this.data.initialAmount) : this.amountARS.setValue(this.data.initialAmount);
                // }
            });

        this.exchangeRate.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((value) => {
                this.updateAmounts(
                    this.formA.value?.currency ?? 'usd',
                    this.getValueDependingOnCurrency(
                        this.formA.value?.currency ?? 'usd',
                    ),
                );
            });

        this.amountARS.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((value) => {
                if (!value || isNaN(value)) return;
                this.updateAmounts('ars', value);
            });

        this.amountUSD.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((value) => {
                if (!value || isNaN(value)) return;
                this.updateAmounts('usd', value);
            });
    }

    ngAfterViewInit(): void {
        this.preloadOrigin();
        this.preloadDestination();
        console.log('initialAmountARS', this.data.initialAmountARS);
        console.log('initialAmountUSD', this.data.initialAmountUSD);
        if (this.data.initialAmountARS) {
            this.amountARS.setValue(this.data.initialAmountARS);
        }
        if (this.data.initialAmountUSD) {
            this.amountUSD.setValue(this.data.initialAmountUSD);
        }
    }

    preloadOrigin(): void {
        const origin = this.data.origin;
        if (!origin) return;
        this.formA.controls.transferAccountType.setValue(
            this.data.origin.accountType,
        );
        switch (origin.accountType) {
            case 'bank':
                this.formABankSearch.searcher.findById(origin.entityId);
                break;
            case 'cash_account':
                this.formACashAccountSearch.searcher.findById(origin.entityId);
                break;
            case 'client':
                this.formAClientSearch.searcher.findById(origin.entityId);
                break;
            case 'provider':
                this.formAProviderSearch.searcher.findById(origin.entityId);
                break;
            case 'user':
                this.formAUserSearch.searcher.findById(origin.entityId);
                break;
        }

        this.formA.controls.currency.setValue(origin.currency ?? 'usd');

        if (this.data.lockOrigin) {
            this.formA.controls.transferAccountType.disable();
            this.formA.controls.bank.disable();
            this.formA.controls.cash_account.disable();
            this.formA.controls.client.disable();
            this.formA.controls.provider.disable();
            this.formA.controls.user.disable();
        }

        if (this.data.lockOriginCurrency) {
            this.formA.controls.currency.disable();
        }
    }

    preloadDestination() {
        const destination = this.data.destination;
        if (!destination) return;
        if (destination.accountType) {
            this.formB.controls.transferAccountType.setValue(
                destination.accountType,
            );
        }
        switch (destination.accountType) {
            case 'bank':
                this.formBBankSearch.searcher.findById(destination.entityId);
                break;
            case 'cash_account':
                this.formBCashAccountSearch.searcher.findById(
                    destination.entityId,
                );
                break;
            case 'client':
                this.formBClientSearch.searcher.findById(destination.entityId);
                break;
            case 'provider':
                this.formBProviderSearch.searcher.findById(
                    destination.entityId,
                );
                break;
            case 'user':
                this.formBUserSearch.searcher.findById(destination.entityId);
                break;
        }

        this.formB.controls.currency.setValue(destination.currency ?? 'usd');

        if (this.data.lockDestination) {
            this.formB.controls.transferAccountType.disable();
            this.formB.controls.bank.disable();
            this.formB.controls.cash_account.disable();
            this.formB.controls.client.disable();
            this.formB.controls.provider.disable();
            this.formB.controls.user.disable();
        }

        if (this.data.lockDestinationCurrency) {
            this.formB.controls.currency.disable();
        }
    }

    updateAmounts(priority: 'usd' | 'ars', value: number): void {
        let ars, usd;
        if (priority === 'usd') {
            usd = rounding(value ?? 0);
            ars = rounding(usd * this.exchangeRate.value);
        } else {
            ars = rounding(value ?? 0);
            usd = rounding(ars / this.exchangeRate.value);
        }

        if (this.amountARS.value !== ars) {
            this.amountARS.setValue(ars, { emitEvent: false });
        }

        if (this.amountUSD.value !== usd) {
            this.amountUSD.setValue(usd, { emitEvent: false });
        }
    }

    onFocus(event: any): void {
        const el = event.srcElement;
        el.select();
    }

    async save(): Promise<void> {
        const rta = await this.messages.question(
            '¿Está seguro que desea realizar la transferencia?',
        );
        if (!rta) return;

        const a = this.formA;
        const valueA = a.getRawValue();
        const b = this.formB;
        const valueB = b.getRawValue();

        this.accountingService
            .transfer({
                origin: {
                    entityId: getEntityId(a),
                    type: valueA.transferAccountType,
                    amount: this.getValueDependingOnCurrency(valueA.currency),
                    currency: valueA.currency,
                },
                destination: {
                    entityId: getEntityId(b),
                    type: valueB.transferAccountType,
                    amount: this.getValueDependingOnCurrency(valueB.currency),
                    currency: valueB.currency,
                },
                details: this.data.title,
                exchangeRate: this.exchangeRate.value,
            })
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.messages.success('Transferencia realizada con éxito');
                this.dialogRef.close();
            });
    }

    isValidForm(form: FormGroup): boolean {
        return (
            form &&
            form.controls['transferAccountType']?.value &&
            !!getEntityId(form)
        );
    }

    get isValid(): boolean {
        return (
            this.isValidForm(this.formA) &&
            this.isValidForm(this.formB) &&
            !isNaN(this.amountARS.value) &&
            !isNaN(this.amountUSD.value) &&
            !!this.amountARS.value &&
            !!this.amountUSD.value
        );
    }

    get afterMovementOriginValue(): number {
        return 0;
    }

    get afterMovementDestinationValue(): number {
        return 0;
    }

    searchAccountTypes(event: AutoCompleteCompleteEvent) {
        const query = event.query;
        this.suggestions = Object.values(ACCOUNTING_TYPES_CONFIG).filter(
            (type) => type.label.toLowerCase().includes(query.toLowerCase()),
        );
    }

    getValueDependingOnCurrency(currency: 'ars' | 'usd'): number {
        return currency === 'ars' ? this.amountARS.value : this.amountUSD.value;
    }

    get formATypeLabel(): string {
        return ACCOUNTING_TYPES_CONFIG[
            this.formA.controls.transferAccountType.value
        ]?.label;
    }

    get formBTypeLabel(): string {
        return ACCOUNTING_TYPES_CONFIG[
            this.formB.controls.transferAccountType.value
        ]?.label;
    }
}

function rounding(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export interface TransferTransactionParams {
    title: string;
    origin?: {
        entityId?: number;
        accountType?: AccountingAccountType;
        currency?: Currency;
    };
    destination?: {
        entityId?: number;
        accountType?: AccountingAccountType;
        currency?: Currency;
    };
    lockOrigin?: boolean;
    lockOriginCurrency?: boolean;
    lockDestination?: boolean;
    lockDestinationCurrency?: boolean;
    initialAmountUSD?: number;
    initialAmountARS?: number;
}

function getEntityId(form: FormGroup): number {
    const accountType = form.controls['transferAccountType'].value;
    return form.controls[accountType]?.value?.id;
}
