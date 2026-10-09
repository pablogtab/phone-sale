import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { StoreSettingsService } from '@/app/core/api/store-settings.service';
import { IconName } from '@/app/shared/ui/icon/icon.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { AuthService } from '@/app/core/auth/auth.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ACCOUNT_SCREENS } from '../../features/accounting/accounts/accounts.component';
import { CurrentRoleService } from '@/app/core/auth/current-role.service';
import { PERMISSION_ACTIONS, ROLES } from '@/app/core/permissions';

@Component({
    selector: 'app-nav-bar',
    imports: [SharedModule, RouterLink, RouterLinkActive],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css',
})
export class NavBarComponent implements OnInit {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    sidenavOpen: boolean = false;
    readonly store = inject(StoreSettingsService);
    private readonly destroyRef = inject(DestroyRef);
    protected readonly currentRoleService$ = inject(CurrentRoleService);

    menuOptions: MenuOption[] = [];

    ngOnInit(): void {
        this.currentRoleService$.currentRole$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe({
                next: (data) => {
                    if (!data) return;
                    const allMenuOptions: MenuOption[] = [
                        {
                            icon: 'dollar-circle',
                            label: 'Dólar',
                            route: '/dolar',
                        },
                        {
                            icon: 'cellphone',
                            label: 'Equipos',
                            route: '/devices',
                        },
                        {
                            icon: 'shopping-cart',
                            label: 'Ventas',
                            route: '/orders',
                        },
                        {
                            icon: 'shopping-cart',
                            label: 'Compras',
                            route: '/purchases',
                        },
                        {
                            icon: 'dollar-circle',
                            label: 'Cuentas',
                            items: [
                                {
                                    icon: 'dollar-circle',
                                    label: 'Proveedores',
                                    route: '/accounts',
                                    queryParams: {
                                        q: btoa(
                                            JSON.stringify(
                                                ACCOUNT_SCREENS.providers,
                                            ),
                                        ),
                                    },
                                },
                                {
                                    icon: 'dollar-circle',
                                    label: 'Bancos',
                                    route: '/accounts',
                                    queryParams: {
                                        q: btoa(
                                            JSON.stringify(
                                                ACCOUNT_SCREENS.banks,
                                            ),
                                        ),
                                    },
                                },
                                {
                                    icon: 'dollar-circle',
                                    label: 'Cajas',
                                    route: '/accounts',
                                    queryParams: {
                                        q: btoa(
                                            JSON.stringify(
                                                ACCOUNT_SCREENS.cash_accounts,
                                            ),
                                        ),
                                    },
                                },
                                {
                                    icon: 'dollar-circle',
                                    label: 'Usuarios',
                                    route: '/accounts',
                                    queryParams: {
                                        q: btoa(
                                            JSON.stringify(
                                                ACCOUNT_SCREENS.users,
                                            ),
                                        ),
                                    },
                                },
                                {
                                    icon: 'dollar-circle',
                                    label: 'Clientes',
                                    route: '/accounts',
                                    queryParams: {
                                        q: btoa(
                                            JSON.stringify(
                                                ACCOUNT_SCREENS.clients,
                                            ),
                                        ),
                                    },
                                },
                            ],
                            condition: () =>
                                data.role === ROLES.admin ||
                                (data.permissions.cash_accounts ?? []).includes(
                                    PERMISSION_ACTIONS.admin_read,
                                ),
                        },
                        {
                            icon: 'users',
                            label: 'Clientes',
                            route: '/clients',
                            condition: () =>
                                data.role === ROLES.admin ||
                                (data.permissions.clients ?? []).includes(
                                    PERMISSION_ACTIONS.admin_read,
                                ),
                        },
                        {
                            icon: 'settings',
                            label: 'Configuración',
                            items: [
                                {
                                    icon: 'settings',
                                    label: 'Tu tienda',
                                    route: '/settings/store',
                                    condition: () => data.role === ROLES.admin,
                                },
                                {
                                    icon: 'settings',
                                    label: 'Modelos',
                                    route: '/settings/device-models',
                                },
                                {
                                    icon: 'settings',
                                    label: 'Ajuste por modelo',
                                    route: 'settings/models/adjustment',
                                },
                                {
                                    icon: 'settings',
                                    label: 'Precios de Referencia',
                                    route: 'settings/prices',
                                },
                                {
                                    icon: 'settings',
                                    label: 'Productos',
                                    route: '/settings/products',
                                },
                                {
                                    icon: 'user-circle',
                                    label: 'Usuarios',
                                    route: '/users',
                                    condition: () =>
                                        data.role === ROLES.admin ||
                                        (data.permissions.users ?? []).includes(
                                            PERMISSION_ACTIONS.admin_read,
                                        ),
                                },
                            ],
                        },
                        {
                            icon: 'user-circle',
                            label: 'Mi Perfil',
                            route: '/profile',
                        },
                        {
                            icon: 'user-circle',
                            label: 'Cerrar Sesión',
                            command: () => this.logout(),
                        },
                    ];

                    const visible = (options: MenuOption[]): MenuOption[] =>
                        options
                            .filter(
                                (option) =>
                                    !option.condition || option.condition(),
                            )
                            .map((option) => ({
                                ...option,
                                items: option.items
                                    ? visible(option.items)
                                    : undefined,
                            }));
                    this.menuOptions = visible(allMenuOptions);
                },
            });
    }

    constructor(
        private readonly router: Router,
        private readonly authService: AuthService,
        private readonly messages: MessagesService,
    ) {}

    close() {
        this.sidenavOpen = false;
    }

    open() {
        this.sidenavOpen = true;
    }

    async logout() {
        const rta = await this.messages.question(
            '¿Está seguro de cerrar sesión?',
        );
        if (!rta) return;
        this.authService.removeData();
        this.router.navigate(['/login']);
    }
}

interface MenuOption {
    icon: IconName;
    label: string;
    route?: string;
    items?: MenuOption[];
    command?: any;
    queryParams?: any;
    condition?: any;
}
