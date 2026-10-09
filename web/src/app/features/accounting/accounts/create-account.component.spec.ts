import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { dialogTest } from '@/testing/dialog-test-bed';
import { CreateAccountComponent } from './create-account.component';
describe('Account creation', () => {
    afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.resetTestingModule(); });
    it.each([['bank', 'banks'], ['cash_account', 'cash-accounts'], ['provider', 'providers']] as const)('creates %s with trimmed name and closes on success', async (type, endpoint) => {
        const t = dialogTest(CreateAccountComponent, type); await t.render();
        t.component.form.controls.name.setValue('  Cuenta nueva  ');
        t.component.save(); t.component.save();
        const r = t.http.expectOne('/api/' + endpoint);
        expect(r.request.method).toBe('POST'); expect(r.request.body).toEqual({ name: 'Cuenta nueva' });
        expect(t.component.saving()).toBe(true);
        r.flush({ id: 3 }); expect(t.ref.close).toHaveBeenCalledWith(true);
    });
    it('rejects blank/short names and retains input on failure for retry', async () => {
        const t = dialogTest(CreateAccountComponent, 'bank'); await t.render();
        t.component.form.controls.name.setValue('   '); t.component.save(); t.http.expectNone('/api/banks');
        t.component.form.controls.name.setValue('Banco nuevo'); t.component.save();
        t.http.expectOne('/api/banks').flush({}, { status: 503, statusText: 'Unavailable' });
        await t.fixture.whenStable();
        expect(t.component.form.controls.name.value).toBe('Banco nuevo');
        expect(t.fixture.nativeElement.textContent).toContain('Podés reintentar');
        expect(t.ref.close).not.toHaveBeenCalled();
        t.component.save(); t.http.expectOne('/api/banks').flush({ id: 3 });
        expect(t.ref.close).toHaveBeenCalledWith(true);
    });
});
