import { Product } from '@/app/core/models/product';
export const cashEntity = {
    id: 1,
    publicId: 'cash-1',
    name: 'Caja Demo',
    active: true,
    createdAt: '2026-10-09',
    updatedAt: '2026-10-09',
};
export const bankEntity = {
    ...cashEntity,
    id: 2,
    publicId: 'bank-2',
    name: 'Banco Demo',
};
import { HttpTestingController } from '@angular/common/http/testing';
export const customer = {
    id: 1,
    publicId: 'customer-1',
    name: 'Ana Demo',
    phoneNumber: '3515550001',
    instagram: 'ana.demo',
    identifier: 'DEMO-1',
    address: 'Calle Demo 1',
    birthDate: '01/01/1990',
    wholesaler: false,
};
export const user = {
    id: 1,
    publicId: 'user-1',
    name: 'Admin',
    lastname: 'Demo',
    role: 'admin' as const,
    permissions: {},
};
export const model = {
    id: 1,
    name: 'iPhone 8',
    index: 1,
    active: true,
    availableColors: [{ id: 1, name: 'Gold', hex: '#d8c5ab', active: true }],
    availableStorageSizes: [{ id: 1, size: '64 GB', index: 64, active: true }],
    priceReferences: [
        {
            id: 1,
            modelId: 1,
            storageSizeId: 1,
            purchasePrice: 100,
            sellingPrice: 150,
            sellingPriceSale: 140,
            sellingPriceWholesale: 120,
            isUsed: false,
        },
    ],
    recommendedAccesories: [] as unknown[],
};
export const product: Product = {
    id: 1,
    publicId: 'product-1',
    deviceId: null,
    createdAt: '2026-10-09',
    updatedAt: '2026-10-09',
    code: 'CABLE',
    description: 'Cable Demo',
    stock: 10,
    costPrice: 5,
    sellingPrice: 10,
    unique: false,
};
export const device = {
    id: 1,
    publicId: 'device-1',
    modelId: 1,
    colorId: 1,
    storageSizeId: 1,
    description: 'iPhone 8 64 GB Gold',
    condition: 'sealed',
    status: 'available',
    hasProblem: false,
    oficialWarranty: false,
    model,
    color: model.availableColors[0],
    storageSize: model.availableStorageSizes[0],
    deviceHistory: [] as unknown[],
    aditionalFiles: [] as unknown[],
    files: [] as unknown[],
};
export const order = {
    id: 1,
    publicId: 'order-1',
    client: customer,
    clientId: 1,
    clientName: customer.name,
    status: 'confirmed',
    type: 'sale',
    exchangeRate: 1500,
    createdAt: '2026-10-09T12:00:00Z',
    items: [
        {
            id: 1,
            quantity: 1,
            product,
            priceUSD: 10,
            priceARS: 15000,
            exchangeRate: 1500,
        },
    ],
    payments: [
        {
            id: 1,
            method: 'cash',
            currency: 'usd',
            amountUSD: 10,
            amountARS: 15000,
            exchangeRate: 1500,
            description: 'Pago Demo',
            transactionId: 1,
        },
    ],
    totalUSD: 10,
};
export const accounts = ['usd', 'ars'].map((currency, index) => ({
    id: index + 1,
    currency,
    balance: currency === 'usd' ? 100 : 150000,
    name: 'Caja Demo',
    type: 'cash_account',
    cashAccountId: 1,
    userId: 1,
    clientId: 1,
    providerId: 1,
    bankId: 1,
    isAsset: true,
}));
export const page = (data: unknown[]) => ({
    data,
    page: 1,
    totalRows: data.length,
    totalPages: data.length ? 1 : 0,
});
export function responseFor(url: string): unknown {
    const path = url.split('?')[0].replace(/\/$/, '');
    if (path === '/api/store-settings') return { name: 'Mi tienda' };
    if (path === '/api/users/me' || path === '/api/users/1') return user;
    if (path === '/api/users/search') return [user];
    if (path === '/api/devices/models' || path === '/api/devices/models/search')
        return [model];
    if (path === '/api/devices/models/1') return model;
    if (path === '/api/devices/color') return model.availableColors;
    if (path === '/api/devices/storage-size')
        return model.availableStorageSizes;
    if (path === '/api/devices/devices') return [device];
    if (path === '/api/devices/devices/1') return device;
    if (path === '/api/products/search') return [product];
    if (path === '/api/products/1') return product;
    if (path === '/api/clients') return page([customer]);
    if (path === '/api/clients/customer-1') return customer;
    if (path === '/api/clients/search') return [customer];
    if (path === '/api/orders') return page([order]);
    if (path === '/api/orders/order-1') return order;
    if (path === '/api/providers/search')
        return [{ id: 1, name: 'Proveedor Demo', technicalService: true }];
    if (path === '/api/cash-accounts/1') return { id: 1, name: 'Caja Demo' };
    if (path === '/api/cash-accounts/search')
        return [{ id: 1, name: 'Caja Demo' }];
    if (path === '/api/banks/search') return [{ id: 1, name: 'Banco Demo' }];
    if (path === '/api/accounting/accounts') return accounts;
    if (path === '/api/accounting/transactions') return [];
    if (path === '/api/model-adjustment')
        return [{ modelId: 1, modelName: model.name, modelAdjustments: [] }];
    if (path.startsWith('/api/parameters/'))
        return {
            key: path.split('/').pop(),
            valueN: path.includes('dolar') ? 1500 : 1,
            updatedAt: '2026-10-09',
        };
    throw new Error(`Missing response fixture: ${url}`);
}
/** Flush each stage of HTTP-driven navigation without forcing component change detection. */
export async function flushScreens(
    http: HttpTestingController,
    done: () => boolean = () => false,
) {
    for (let stage = 0; stage < 30; stage++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        const requests = http.match(() => true);
        for (const request of requests) {
            if (request.cancelled) continue;
            if (request.request.method !== 'GET')
                throw new Error(
                    `Unexpected mutation during rendering: ${request.request.method} ${request.request.url}`,
                );
            request.flush(responseFor(request.request.url));
        }
        if (done() && !requests.length) return;
    }
}
