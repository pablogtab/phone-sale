import { CurrentRoleService } from '@/app/core/auth/current-role.service';
import { CreateAccountComponent, ACCOUNT_CREATION } from './create-account.component';
import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { SharedModule } from '@/app/shared/ui/shared.module';
import {
    AccountingAccount,
    AccountingAccountType,
} from '@/app/core/models/accounting';
import { AccountingService } from '@/app/core/api/accounting.service';
import { BalanceColorDirective } from '@/app/core/utils/balance-color.directive';
import { Dialog } from '@angular/cdk/dialog';
import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
    AccountDetailModalComponent,
    DialogParamsAccountDetailModal,
} from './account-detail-modal/account-detail-modal.component';

@Component({
    selector: 'app-accounts',
    imports: [CurrencyPipe, BalanceColorDirective, SharedModule],
    templateUrl: './accounts.component.html',
    styleUrl: './accounts.component.css',
})
export class AccountsComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    route = inject(ActivatedRoute);
    router = inject(Router);
    accountingService = inject(AccountingService);
    dialog = inject(Dialog);

    currentRole = inject(CurrentRoleService);
    get canCreate() { return this.data.type in ACCOUNT_CREATION; }
    get createLabel() { return this.data.type === 'bank' ? 'Nueva cuenta' : this.data.type === 'cash_account' ? 'Nueva caja' : 'Nuevo proveedor'; }
    createAccount() {
        if (!this.canCreate) return;
        this.dialog.open(CreateAccountComponent, { data: this.data.type }).closed
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime)).subscribe(created => { if (created) this.loadData(); });
    }
    data: AccountUrlQueryParams = {} as AccountUrlQueryParams;

    entities: IEntities[] = [];

    ngOnInit() {
        this.route.queryParams
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((p) => {
                this.data = this.parseUrlParams(p ?? { q: '' });
                this.loadData();
            });
    }

    loadData() {
        this.accountingService
            .getAccounts(this.data.type)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((accounts) => {
                this.entities = Object.entries(
                    Object.groupBy(
                        accounts,
                        (obj) => obj[this.data.selectorId],
                    ),
                ).map(([key, value]) => ({
                    key,
                    name: value[0]?.['name'],
                    usdAcc: value.find((obj) => obj.currency === 'usd'),
                    arsAcc: value.find((obj) => obj.currency === 'ars'),
                }));

                //this.simpleTransaction(this.entities[0]);
            });
    }

    parseUrlParams(obj: unknown): AccountUrlQueryParams {
        try {
            const { q } = obj as { q: string };
            const query = JSON.parse(atob(q));
            if (!validAccountUrlQueryParams(query))
                throw new Error('Invalid query params');
            return query;
        } catch (error) {
            console.error(error);
            this.router.navigate(['/home']);
            throw new Error('Invalid query params');
        }
    }

    currencyExchange(entity: IEntities, to: 'usd' | 'ars') {
        // const data: TransferTransactionParams = {
        //     title: `Cambio de moneda`,
        //     destinationAccount: to === 'usd' ? entity.usdAcc : entity.arsAcc,
        //     originAccount: to === 'usd' ? entity.arsAcc : entity.usdAcc,
        //     lockOriginAccount: true,
        //     lockDestinationAccount: true,
        //     initialAmount: to === 'usd' ? entity.arsAcc.balance : entity.usdAcc.balance
        // }
        // this.dialog.open(TransferAccountingTransactionComponent, {
        //     data
        // }).closed.pipe(refreshView(this.viewChangeDetector, this.viewLifetime)).subscribe(() => {
        //     this.loadData();
        // })
    }

    // simpleTransaction(entity: IEntities) {
    //     const data: SimpleTransactionParams = {
    //         title: `Movimiento de cuenta`,
    //         type: this.data.type,
    //         providerId: parseInt(entity.key),
    //         lockAccountType: true,
    //         lockAccount: true,
    //         buttonCreditText: 'Compra',
    //         buttonDebitText: 'Pago'
    //     }

    //     this.dialog.open(SimpleAccountingTransactionComponent, {
    //         data
    //     }).closed.pipe(refreshView(this.viewChangeDetector, this.viewLifetime)).subscribe(() => {
    //         this.loadData();
    //     })
    // }

    transferTransaction(entity: IEntities) {
        // const data: TransferTransactionParams = {
        //     title: `Transferencia entre cuentas`,
        //     destinationAccount: entity.usdAcc,
        //     originAccount: entity.arsAcc,
        //     initialAmount: entity.arsAcc.balance
        // }
        // this.dialog.open(TransferAccountingTransactionComponent, {
        //     data
        // }).closed.pipe(refreshView(this.viewChangeDetector, this.viewLifetime)).subscribe(() => {
        //     this.loadData();
        // })
    }

    openAccount(entity: IEntities) {
        const data: DialogParamsAccountDetailModal = {
            accountType: this.data.type,
            entityId: parseInt(entity.key),
            entityLabel: entity.name,
            transferTo: this.data.transferTo,
            transferFrom: this.data.transferFrom,
        };

        this.dialog
            .open(AccountDetailModalComponent, { data })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => {
                this.loadData();
            });
    }
}

function validAccountUrlQueryParams(
    query: any,
): query is AccountUrlQueryParams {
    return query.title && query.type && query.selectorId;
}

export interface TransferConfig {
    transferTo?: {
        title: string;
        buttonLabel: string;
    };
    transferFrom?: {
        title: string;
        buttonLabel: string;
    };
}

export interface AccountUrlQueryParams extends TransferConfig {
    title: string;
    type: AccountingAccountType;
    selectorId:
        'providerId' | 'clientId' | 'userId' | 'bankId' | 'cashAccountId';
}

export const ACCOUNT_SCREENS: Record<
    'providers' | 'cash_accounts' | 'banks' | 'users' | 'clients',
    AccountUrlQueryParams
> = {
    providers: {
        title: 'Cuentas de Proveedores',
        type: 'provider',
        selectorId: 'providerId',
        transferFrom: {
            title: 'Pago a Proveedor',
            buttonLabel: 'Pagar',
        },
    },
    cash_accounts: {
        title: 'Cuentas de Caja',
        type: 'cash_account',
        selectorId: 'cashAccountId',
        transferTo: {
            title: 'Retiro de Caja',
            buttonLabel: 'Retirar',
        },
    },
    banks: {
        title: 'Cuentas de Banco',
        type: 'bank',
        selectorId: 'bankId',
        transferFrom: {
            title: 'Depósito en Banco',
            buttonLabel: 'Depositar',
        },
        transferTo: {
            title: 'Transferencia',
            buttonLabel: 'Transferir A',
        },
    },
    users: {
        title: 'Cuentas de Usuario',
        type: 'user',
        selectorId: 'userId',
        transferFrom: {
            title: 'Retiro de Usuario',
            buttonLabel: 'Retirar',
        },
    },
    clients: {
        title: 'Cuentas de Cliente',
        type: 'client',
        selectorId: 'clientId',
    },
} as const;

interface IEntities {
    key: string;
    name: string;
    usdAcc?: AccountingAccount;
    arsAcc?: AccountingAccount;
}
