import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { ClientSearchComponent } from '@/app/shared/ui/searchers/client-search.component';
import { ProviderSearchComponent } from '@/app/shared/ui/searchers/provider-search.component';
import { SelectableConfig } from '@/app/shared/ui/selectable/selectable.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import {
    ACCOUNTING_TYPES_CONFIG,
    AccountingAccountType,
} from '@/app/core/models/accounting';
import { Bank } from '@/app/core/models/bank';
import { CashAccount } from '@/app/core/models/cash-account';
import { Client } from '@/app/core/models/client';
import { Currency } from '@/app/core/models/currency';
import { Provider } from '@/app/core/models/provider';
import { User } from '@/app/core/models/user';
import { AccountingService } from '@/app/core/api/accounting.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';

import { BankSearchComponent } from '../../../shared/ui/searchers/bank-search.component';
import { CashAccountsSearchComponent } from '../../../shared/ui/searchers/cash-accounts-search.component';
import { UserSearchComponent } from '../../../shared/ui/searchers/user-search.component';

@Component({
    selector: 'app-simple-accounting-transaction',
    imports: [
        SharedModule,
        ProviderSearchComponent,
        ReactiveFormsModule,
        SelectButtonModule,
        BankSearchComponent,
        UserSearchComponent,
        CashAccountsSearchComponent,
        ClientSearchComponent,
        InputNumberModule,
    ],
    templateUrl: './simple-accounting-transaction.component.html',
    styleUrl: './simple-accounting-transaction.component.css',
})
export class SimpleAccountingTransactionComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    dialogRef = inject(DialogRef);
    data: SimpleTransactionParams = inject(DIALOG_DATA);

    buttonCredit = 'Crédito';
    buttonDebit = 'Débito';

    message = inject(MessagesService);
    accountingService = inject(AccountingService);

    accountTypes: IAccountType[] = Object.entries(ACCOUNTING_TYPES_CONFIG).map(
        ([key, value]) => ({
            label: value.label,
            type: key as AccountingAccountType,
            isAsset: value.isAsset,
        }),
    );

    @ViewChild(ProviderSearchComponent) providerSearch: ProviderSearchComponent;
    @ViewChild(BankSearchComponent) bankSearch: BankSearchComponent;
    @ViewChild(CashAccountsSearchComponent)
    cashAccountsSearch: CashAccountsSearchComponent;
    @ViewChild(UserSearchComponent) userSearchComponent: UserSearchComponent;
    @ViewChild(ClientSearchComponent)
    clientSearchComponent: ClientSearchComponent;

    form = new FormGroup({
        selectedAccountType: new FormControl<AccountingAccountType>(null),
        provider: new FormControl<Provider>(null),
        bank: new FormControl<Bank>(null),
        client: new FormControl<Client>(null),
        cashAccount: new FormControl<CashAccount>(null),
        user: new FormControl<User>(null),
        amount: new FormControl<number>(null),
        currency: new FormControl<Currency>(null),
        transactionSelected: new FormControl<'debit' | 'credit'>(null),
        details: new FormControl<string>(''),
    });

    selectableConfig: SelectableConfig<IAccountType> = {
        parseLabel: (item) => item.label,
    };
    selectableCurrencyConfig: SelectableConfig<{
        label: string;
        currency: 'usd' | 'ars';
    }> = {
        parseLabel: (item) => item.label,
    };

    currencies = [
        { label: 'ARS', currency: 'ars' },
        { label: 'USD', currency: 'usd' },
    ];

    get validForm() {
        const values = this.form.getRawValue();
        return Boolean(
            values.selectedAccountType &&
            this.data.entityId &&
            values.amount > 0 &&
            values.currency &&
            values.transactionSelected,
        );
    }

    ngOnInit(): void {
        if (this.data.type) {
            this.form.get('selectedAccountType').setValue(this.data.type);
        }
        if (this.data.buttonCreditText) {
            this.buttonCredit = this.data.buttonCreditText;
        }
        if (this.data.buttonDebitText) {
            this.buttonDebit = this.data.buttonDebitText;
        }
    }

    ngAfterViewInit(): void {
        this.form.get('provider').disable();
        this.form.get('bank').disable();
        this.form.get('cashAccount').disable();
        this.form.get('user').disable();
        this.form.get('client').disable();

        if (this.data.entityId) {
            switch (this.data.type) {
                case 'provider':
                    this.providerSearch?.searcher.findById(this.data.entityId);
                    break;
                case 'bank':
                    this.bankSearch?.searcher.findById(this.data.entityId);
                    break;
                case 'cash_account':
                    this.cashAccountsSearch?.searcher.findById(
                        this.data.entityId,
                    );
                    break;
                case 'user':
                    this.userSearchComponent?.searcher.findById(
                        this.data.entityId,
                    );
                    break;
                case 'client':
            }
        }

        // this.form.controls.selectedAccountType.valueChanges.pipe(refreshView(this.viewChangeDetector, this.viewLifetime)).subscribe((value) => {
        //     if (!value) return;
        //     if (value === 'provider') {
        //         this.providerSearch.searcher.search()
        //         setTimeout(() => {
        //             this.providerSearch.searcher.open.set(true);
        //         }, 10)
        //     }
        // })
    }

    save() {
        if (!this.validForm) return;

        const values = this.form.getRawValue();

        this.accountingService
            .simpleTransaction({
                accountType: values.selectedAccountType,
                [ACCOUNTING_TYPES_CONFIG[values.selectedAccountType].key]:
                    this.data.entityId,
                amount:
                    Math.abs(values.amount) *
                    (values.transactionSelected === 'credit' ? 1 : -1),
                currency: values.currency,
                details: values.details,
            })
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe(() => {
                this.message.success('Transacción realizada con éxito');
                this.form.reset();
                this.dialogRef.close();
            });
    }

    get isAsset(): boolean {
        // return !!this.form.value.selectedAccountType?.isAsset;
        const type = this.form.value.selectedAccountType;
        return !!ACCOUNTING_TYPES_CONFIG[type]?.isAsset;
    }

    get accountTypeLabel(): string {
        return ACCOUNTING_TYPES_CONFIG[this.form.value.selectedAccountType]
            ?.label;
    }
}

interface IAccountType {
    label: string;
    type: AccountingAccountType;
    isAsset: boolean; //true = active, false = passive
}

export interface SimpleTransactionParams {
    title: string;
    type: AccountingAccountType;
    entityId: number;
    buttonCreditText?: string;
    buttonDebitText?: string;
}
