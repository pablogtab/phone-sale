import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { IconComponent } from '@/app/shared/ui/icon/icon.component';
import { AccountingAccount } from '@/app/core/models/accounting';
import { User } from '@/app/core/models/user';
import { AccountingService } from '@/app/core/api/accounting.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { UserService } from '@/app/core/api/user.service';
import { BalanceColorDirective } from '@/app/core/utils/balance-color.directive';
import { environment } from '@/environments';
import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-my-profile',
    imports: [IconComponent, BalanceColorDirective, CurrencyPipe],
    templateUrl: './my-profile.component.html',
    styleUrl: './my-profile.component.css',
})
export class MyProfileComponent {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    accountService = inject(AccountingService);
    user: User;
    accounts: { currency: string; balance: number }[] = [];

    constructor(
        private readonly userService: UserService,
        private message: MessagesService,
    ) {}

    async ngOnInit() {
        this.user = await firstValueFrom(this.userService.getMyUser());
        this.accountService
            .getAccounts('user', this.user.id)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((accounts) => {
                this.accounts = accounts.map((acc) => {
                    return {
                        currency: acc.currency === 'usd' ? 'USD' : 'Pesos',
                        balance: acc.balance,
                    };
                });
            });
    }

    get profilePictureUrl(): string {
        return environment.filesUrl + this.user?.profilePicture;
    }

    changeProfilePicture() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (!input.files) return;
            const rta = await this.message.question(
                '¿Está seguro de continuar',
            );
            if (!rta) return;
            this.userService
                .changeProfilePicture(input.files[0])
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe();
        };
        input.click();
    }
}
