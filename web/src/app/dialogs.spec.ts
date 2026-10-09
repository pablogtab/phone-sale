import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { dialogTest } from '@/testing/dialog-test-bed';
import { model, accounts } from '@/testing/screen-fixtures';
import { DeviceModelEditComponent } from './features/settings/device-model-settings/device-model-edit/device-model-edit.component';
import { DeviceColorSettingsComponent } from './features/settings/device-color-settings/device-color-settings.component';
import { DeviceStorageSizeSettingsComponent } from './features/settings/device-storage-size-settings/device-storage-size-settings.component';
import { EditProductComponent } from './features/settings/products/edit-product/edit-product.component';
import { EditUserComponent } from './features/users/edit-user/edit-user.component';
import { DeviceInfoComponent } from './features/devices/device-info/device-info.component';
import { EditDeviceComponent } from './features/devices/edit-device/edit-device.component';
import { DeviceTestProcessComponent } from './features/devices/device-test-process/device-test-process.component';
import { ServiceComponent } from './features/devices/service/service.component';
import { ServiceDetailComponent } from './features/devices/service-detail/service-detail.component';
import { PurchasePaymentComponent } from './features/purchases/purchase-payment/purchase-payment.component';
import { NewOrderPaymentComponent } from './features/orders/edit-order/new-order-payment/new-order-payment.component';
import { SimpleAccountingTransactionComponent } from './features/accounting/simple-accounting-transaction/simple-accounting-transaction.component';
import { TransferAccountingTransactionComponent } from './features/accounting/transfer-accounting-transaction/transfer-accounting-transaction.component';
import { AccountDetailModalComponent } from './features/accounting/accounts/account-detail-modal/account-detail-modal.component';
import { EditObjectComponent } from './shared/ui/edit-object/edit-object.component';
const cases: [string, Type<unknown>, unknown, string][] = [
    [
        'new model',
        DeviceModelEditComponent,
        { title: 'Nuevo modelo' },
        'Nuevo modelo',
    ],
    [
        'existing model',
        DeviceModelEditComponent,
        { title: 'Editar modelo', model },
        'Gold',
    ],
    ['colors', DeviceColorSettingsComponent, { title: 'Colores' }, 'Gold'],
    [
        'storage',
        DeviceStorageSizeSettingsComponent,
        { title: 'Almacenamiento' },
        '64 GB',
    ],
    [
        'new accessory',
        EditProductComponent,
        { title: 'Nuevo accesorio' },
        'Descripción',
    ],
    [
        'existing accessory',
        EditProductComponent,
        { title: 'Editar accesorio', productId: 1 },
        'Descripción',
    ],
    ['new user', EditUserComponent, { title: 'Nuevo usuario' }, 'Nombre'],
    [
        'existing user',
        EditUserComponent,
        { title: 'Editar usuario', userId: 1 },
        'Nombre',
    ],
    ['device information', DeviceInfoComponent, { deviceId: 1 }, 'iPhone 8'],
    ['new device', EditDeviceComponent, { title: 'Nuevo equipo' }, 'IMEI'],
    [
        'existing device',
        EditDeviceComponent,
        { title: 'Editar equipo', deviceId: 1 },
        'Gold',
    ],
    ['device testing', DeviceTestProcessComponent, { deviceId: 1 }, 'Admin'],
    ['technical service', ServiceComponent, { deviceId: 1 }, 'Proveedor'],
    [
        'service completion',
        ServiceDetailComponent,
        { deviceId: 1 },
        'Motivo servicio',
    ],
    [
        'purchase payment',
        PurchasePaymentComponent,
        { amount: 50 },
        'Cuenta Corriente',
    ],
    [
        'order payment',
        NewOrderPaymentComponent,
        { amountUSD: 50, exchangeRate: 1500, currency: 'usd' },
        'Pago',
    ],
    [
        'account movement',
        SimpleAccountingTransactionComponent,
        { title: 'Movimiento', type: 'cash_account', entityId: 1 },
        'Movimiento',
    ],
    [
        'account transfer',
        TransferAccountingTransactionComponent,
        { title: 'Transferencia' },
        'Transferencia',
    ],
    [
        'account history',
        AccountDetailModalComponent,
        {
            entityLabel: 'Caja Demo',
            entityId: 1,
            accountType: 'cash_account',
            transferTo: {},
        },
        'Caja Demo',
    ],
    [
        'generic labels',
        EditObjectComponent,
        {
            title: 'Editar etiqueta',
            fields: [
                { key: 'name', label: 'Nombre', type: 'text', required: true },
            ],
            initialValues: { name: 'Caja Demo' },
        },
        'Nombre',
    ],
];
describe('all business dialogs', () => {
    afterEach(() => {
        try {
            TestBed.inject(HttpTestingController).verify();
        } finally {
            TestBed.resetTestingModule();
        }
    });
    for (const [name, component, data, text] of cases)
        it(`renders ${name} from asynchronous data without writing`, async () => {
            const test = dialogTest(component, data);
            await test.render();
            expect(test.fixture.nativeElement.textContent).toContain(text);
            expect(test.ref.close).not.toHaveBeenCalled();
        });
});
