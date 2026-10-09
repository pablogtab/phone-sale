import { Routes } from '@angular/router';

import { isAuthenticated } from './core/auth/is-authenticated';
import { HasPermissionGuard } from './core/auth/has-permission.guard';
import { PERMISSIONS, PERMISSION_ACTIONS } from './core/permissions';
import { SetRoleGuard } from './core/auth/set-role.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/login/login.component').then(
                (m) => m.LoginComponent,
            ),
    },
    {
        path: '',
        loadComponent: () =>
            import('./layout/shell.component').then((m) => m.ShellComponent),
        canActivate: [isAuthenticated, SetRoleGuard],
        children: [
            { path: 'settings/store', loadComponent: () => import('./features/settings/store/store.component').then(m => m.StoreComponent) },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'devices',
            },
            {
                path: 'profile',
                loadComponent: () =>
                    import('./features/my-profile/my-profile.component').then(
                        (m) => m.MyProfileComponent,
                    ),
            },
            {
                path: 'users',
                canActivate: [HasPermissionGuard],
                data: {
                    permission: {
                        permission: PERMISSIONS.users,
                        actions: [
                            PERMISSION_ACTIONS.read,
                            PERMISSION_ACTIONS.admin_read,
                        ],
                    },
                },
                loadComponent: () =>
                    import('./features/users/users.component').then(
                        (m) => m.UsersComponent,
                    ),
            },
            {
                path: 'purchases',
                loadComponent: () =>
                    import('./features/purchases/purchases.component').then(
                        (m) => m.PurchasesComponent,
                    ),
            },
            {
                path: 'dolar',
                loadComponent: () =>
                    import('./features/dolar/dolar.component').then(
                        (m) => m.DolarComponent,
                    ),
            },
            {
                path: 'clients/:id',
                loadComponent: () =>
                    import('./features/clients/client-detail/client-detail.component').then(
                        (m) => m.ClientDetailComponent,
                    ),
            },
            {
                path: 'clients',
                loadComponent: () =>
                    import('./features/clients/clients.component').then(
                        (m) => m.ClientsComponent,
                    ),
            },
            {
                path: 'settings/device-models',
                loadComponent: () =>
                    import('./features/settings/device-model-settings/device-model-settings.component').then(
                        (m) => m.DeviceModelSettingsComponent,
                    ),
            },
            {
                path: 'settings/prices',
                loadComponent: () =>
                    import('./features/settings/prices-settings/prices-settings.component').then(
                        (m) => m.PricesSettingsComponent,
                    ),
            },
            {
                path: 'settings/models/adjustment',
                loadComponent: () =>
                    import('./features/settings/model-adjustment/model-adjustment.component').then(
                        (m) => m.ModelAdjustmentComponent,
                    ),
            },
            {
                path: 'settings/products',
                loadComponent: () =>
                    import('./features/settings/products/products.component').then(
                        (m) => m.ProductsComponent,
                    ),
            },
            {
                path: 'devices',
                loadComponent: () =>
                    import('./features/devices/devices.component').then(
                        (m) => m.DevicesComponent,
                    ),
            },
            {
                path: 'accounts',
                loadComponent: () =>
                    import('./features/accounting/accounts/accounts.component').then(
                        (m) => m.AccountsComponent,
                    ),
            },
            {
                path: 'orders',
                loadComponent: () =>
                    import('./features/orders/orders.component').then(
                        (m) => m.OrdersComponent,
                    ),
            },
            {
                path: 'orders/order',
                loadComponent: () =>
                    import('./features/orders/edit-order/edit-order.component').then(
                        (m) => m.EditOrderComponent,
                    ),
            },
            {
                path: 'orders/order/:orderPublicId',
                loadComponent: () =>
                    import('./features/orders/edit-order/edit-order.component').then(
                        (m) => m.EditOrderComponent,
                    ),
            },
        ],
    },
    { path: '**', pathMatch: 'full', redirectTo: '' },
];
