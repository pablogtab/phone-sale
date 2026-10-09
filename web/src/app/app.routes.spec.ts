import { TestBed } from '@angular/core/testing';
import {
    provideRouter,
    withComponentInputBinding,
    Router,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import {
    provideHttpClientTesting,
    HttpTestingController,
} from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { LOCAL_STORAGE_TOKEN_KEY } from './core/const';
import { flushScreens } from '../testing/screen-fixtures';

const cashQuery = btoa(
    JSON.stringify({
        title: 'Cuentas de Caja',
        type: 'cash_account',
        selectorId: 'cashAccountId',
    }),
);
const cases = [
    ['/', 'iPhone 8'],
    ['/devices', 'iPhone 8'],
    ['/clients', 'Ana Demo'],
    ['/clients/customer-1', 'Ana Demo'],
    ['/orders', 'Ana Demo'],
    ['/orders/order', 'Nueva orden'],
    ['/orders/order/order-1', 'Orden completada'],
    ['/purchases', 'Compras a proveedores'],
    ['/dolar', 'Cotización del dólar'],
    ['/settings/store', 'Tu tienda'],
    ['/settings/device-models', 'iPhone 8'],
    ['/settings/prices', 'iPhone 8'],
    ['/settings/models/adjustment', 'Iphone 8'],
    ['/settings/products', 'Cable Demo'],
    ['/users', 'Admin'],
    ['/profile', 'Admin'],
    [`/accounts?q=${cashQuery}`, 'Caja Demo'],
] as const;
describe('all routed frontend screens', () => {
    let http: HttpTestingController;
    beforeEach(() => {
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, 'test-session');
        TestBed.configureTestingModule({
            providers: [
                provideRouter(routes, withComponentInputBinding()),
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
            ],
        });
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
        try {
            http.verify();
        } finally {
            localStorage.clear();
            TestBed.resetTestingModule();
        }
    });
    for (const [path, content] of cases) {
        it(`renders ${path} and its asynchronous data`, async () => {
            const harness = await RouterTestingHarness.create();
            harness.fixture.autoDetectChanges();
            let complete = false;
            const navigation = harness.navigateByUrl(path).then(() => {
                complete = true;
            });
            await flushScreens(http, () => complete);
            await navigation;
            await harness.fixture.whenStable();
            await flushScreens(http, () => true);
            await harness.fixture.whenStable();
            expect(harness.routeNativeElement?.textContent).toContain(content);
            if (path === '/')
                expect(TestBed.inject(Router).url).toBe('/devices');
        });
    }
    it('redirects protected screens without a session to the actual login form', async () => {
        localStorage.clear();
        const harness = await RouterTestingHarness.create('/clients');
        expect(TestBed.inject(Router).url).toBe('/login');
        expect(harness.routeNativeElement.textContent).toContain(
            'Iniciar sesión',
        );
    });
});
