import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { AccountingAccountType } from '@/app/core/models/accounting';
import { CURRENCIES, Currency } from '@/app/core/models/currency';
import {
    AccountingService,
    GetTransactionDto,
} from '@/app/core/api/accounting.service';
import { BalanceColorDirective } from '@/app/core/utils/balance-color.directive';
import { Dialog, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import {
    SimpleAccountingTransactionComponent,
    SimpleTransactionParams,
} from '../../simple-accounting-transaction/simple-accounting-transaction.component';
import {
    TransferAccountingTransactionComponent,
    TransferTransactionParams,
} from '../../transfer-accounting-transaction/transfer-accounting-transaction.component';
import { TransferConfig } from '../accounts.component';

@Component({
    selector: 'app-account-detail-modal',
    imports: [SharedModule, BalanceColorDirective],
    templateUrl: './account-detail-modal.component.html',
    styleUrl: './account-detail-modal.component.css',
})
export class AccountDetailModalComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    title: string;
    accountingService = inject(AccountingService);
    data: DialogParamsAccountDetailModal = inject(DIALOG_DATA);
    dialog = inject(Dialog);

    isAsset: boolean;

    usdAccount: IAccount;
    arsAccount: IAccount;

    transactions: ITransaction[] = [];

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.title = 'Cuenta Corriente ' + this.data.entityLabel;
        this.accountingService
            .getAccounts(this.data.accountType, this.data.entityId)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((accounts) => {
                const usd = accounts.find((a) => a.currency === CURRENCIES.usd);

                if (usd) {
                    this.usdAccount = {
                        balance: usd.balance,
                        currency: usd.currency,
                        currencyLabel: 'USD',
                        symbol: 'U$D',
                    };

                    this.isAsset = usd.isAsset;
                }

                const ars = accounts.find((a) => a.currency === CURRENCIES.ars);

                if (ars) {
                    this.arsAccount = {
                        balance: ars.balance,
                        currency: ars.currency,
                        symbol: '$',
                        currencyLabel: 'ARS',
                    };

                    this.isAsset = ars.isAsset;
                }

                this.findTransactions();
            });
    }

    findTransactions() {
        this.accountingService
            .findTransactions({
                entityId: this.data.entityId,
                type: this.data.accountType,
                currency: this.accounts.map((a) => a.currency),
                limit: 100,
            })
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((transactions) => {
                this.transactions = transactions;
            });
    }

    simpleTransaction() {
        const data: SimpleTransactionParams = {
            title: `Movimiento de cuenta`,
            type: this.data.accountType,
            entityId: this.data.entityId,
            buttonCreditText: 'Acredita',
            buttonDebitText: 'Debita',
        };

        this.dialog
            .open(SimpleAccountingTransactionComponent, {
                data,
            })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => {
                this.ngOnInit();
            });
    }

    transferTo() {
        const data: TransferTransactionParams = {
            title: this.data.transferTo.title,
            origin: {
                entityId: this.data.entityId,
                accountType: this.data.accountType,
            },
        };

        this.dialog
            .open(TransferAccountingTransactionComponent, {
                data,
            })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => {
                this.ngOnInit();
            });
    }

    transferFrom() {
        const data: TransferTransactionParams = {
            title: `Movimiento entre cuentas`,
            // origin: {
            //     entityId: this.data.entityId,
            //     accountType: this.data.accountType
            // },
            destination: {
                entityId: this.data.entityId,
                accountType: this.data.accountType,
            },
            lockDestination: true,
        };

        this.dialog
            .open(TransferAccountingTransactionComponent, {
                data,
            })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => {
                this.ngOnInit();
            });
    }

    currencyExchange(atob: boolean = true) {
        const data: TransferTransactionParams = {
            title: `Cambio de moneda`,
            origin: {
                entityId: this.data.entityId,
                accountType: this.data.accountType,
                currency: atob ? CURRENCIES.ars : CURRENCIES.usd,
            },
            destination: {
                entityId: this.data.entityId,
                accountType: this.data.accountType,
                currency: atob ? CURRENCIES.usd : CURRENCIES.ars,
            },
            lockDestination: true,
            lockDestinationCurrency: true,
            lockOrigin: true,
            lockOriginCurrency: true,
            initialAmountARS: atob ? this.arsAccount.balance : undefined,
            initialAmountUSD: !atob ? this.usdAccount.balance : undefined,
        };

        this.dialog
            .open(TransferAccountingTransactionComponent, {
                data,
            })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => {
                this.ngOnInit();
            });
    }

    get accounts(): IAccount[] {
        return [this.usdAccount, this.arsAccount].filter((a) => a);
    }
}

export interface DialogParamsAccountDetailModal extends TransferConfig {
    accountType: AccountingAccountType;
    entityId: number;
    entityLabel: string;
}

interface ITransaction extends GetTransactionDto {}

interface IAccount {
    currency: Currency;
    currencyLabel: string;
    symbol: string;
    balance: number;
}
