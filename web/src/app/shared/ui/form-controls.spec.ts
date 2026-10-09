import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { SelectableComponent } from './selectable/selectable.component';
import { SelectableOptionComponent } from './selectable/selectable-option/selectable-option.component';
import { EditSaveCancelComponent } from './edit-save-cancel/edit-save-cancel.component';
import { CurrencyMaskDirective } from '../directives/currency-mask.directive';
import { TimeElapsedPipe } from '@/app/pipes/time-elapsed.pipe';
import { FastAddDeviceComponent } from './fast-add-device/fast-add-device.component';
import { RecommendedAccesoriesComponent } from '@/app/features/orders/edit-order/recommended-accesories/recommended-accesories.component';
import { dialogTest } from '@/testing/dialog-test-bed';
import { model, product } from '@/testing/screen-fixtures';
@Component({
    imports: [CheckboxComponent, ReactiveFormsModule],
    template: '<checkbox [formControl]="control" label="Mayorista" />',
})
class CheckboxHost {
    control = new FormControl(false);
}
@Component({
    imports: [SelectableComponent, SelectableOptionComponent],
    template:
        '<selectable [value]="control" [config]="config"><selectable-option [value]="\'ARS\'"/><selectable-option [value]="\'USD\'"/></selectable>',
})
class SelectHost {
    control = new FormControl('');
    config = {
        parseLabel: (value: string) => (typeof value === 'string' ? value : ''),
    };
}
@Component({
    imports: [CurrencyMaskDirective, ReactiveFormsModule],
    template: '<input type="text" currencyMask [formControl]="amount" />',
})
class MoneyHost {
    amount = new FormControl<number | string>(1234.5);
}
describe('real form control integrations', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            providers: [provideNoopAnimations()],
        }),
    );
    afterEach(() => {
        vi.useRealTimers();
        TestBed.resetTestingModule();
    });
    it('checkbox propagates clicks and touched state to its parent form', async () => {
        const f = TestBed.createComponent(CheckboxHost);
        f.autoDetectChanges();
        await f.whenStable();
        const button = f.nativeElement.querySelector('button');
        expect(button.getAttribute('aria-checked')).toBe('false');
        button.click();
        await f.whenStable();
        expect(f.componentInstance.control.value).toBe(true);
        expect(f.componentInstance.control.touched).toBe(true);
        expect(button.getAttribute('aria-checked')).toBe('true');
    });
    it('checkbox reflects programmatic values and disabled state', async () => {
        const f = TestBed.createComponent(CheckboxHost);
        f.autoDetectChanges();
        await f.whenStable();
        f.componentInstance.control.setValue(true);
        f.componentInstance.control.disable();
        await f.whenStable();
        const button = f.nativeElement.querySelector('button');
        expect(button.getAttribute('aria-checked')).toBe('true');
        expect(button.disabled).toBe(true);
        button.click();
        expect(f.componentInstance.control.value).toBe(true);
    });
    it('selects a currency through the visible dropdown and updates its form control', async () => {
        const f = TestBed.createComponent(SelectHost);
        f.autoDetectChanges();
        await f.whenStable();
        const input = f.nativeElement.querySelector('input');
        input.dispatchEvent(new Event('focus'));
        await f.whenStable();
        const usd = [
            ...f.nativeElement.querySelectorAll('.options button'),
        ].find((b: HTMLElement) => b.textContent.trim() === 'USD');
        usd.click();
        await f.whenStable();
        expect(f.componentInstance.control.value).toBe('USD');
        expect(input.value).toBe('USD');
        expect(f.nativeElement.querySelector('.options')).toBeNull();
    });
    it('filters available options case-insensitively and closes on outside click', async () => {
        const f = TestBed.createComponent(SelectHost);
        f.autoDetectChanges();
        await f.whenStable();
        const input = f.nativeElement.querySelector('input');
        input.dispatchEvent(new Event('focus'));
        input.value = 'us';
        input.dispatchEvent(new Event('input'));
        await f.whenStable();
        expect(f.nativeElement.querySelector('.options').textContent).toContain(
            'USD',
        );
        expect(
            f.nativeElement.querySelector('.options').textContent,
        ).not.toContain('ARS');
        document.body.click();
        await f.whenStable();
        expect(f.nativeElement.querySelector('.options')).toBeNull();
    });
    it('disabling a selector disables its input and action buttons', async () => {
        const f = TestBed.createComponent(SelectHost);
        f.autoDetectChanges();
        await f.whenStable();
        f.componentInstance.control.disable();
        await f.whenStable();
        expect(f.nativeElement.querySelector('input').disabled).toBe(true);
        expect(
            [...f.nativeElement.querySelectorAll('button')].every(
                (b: HTMLButtonElement) => b.disabled,
            ),
        ).toBe(true);
    });
    it('formats money for display and restores a numeric value after blur', async () => {
        const f = TestBed.createComponent(MoneyHost);
        f.autoDetectChanges();
        await f.whenStable();
        const input = f.nativeElement.querySelector('input');
        expect(input.value).toBe('$ 1.234,50');
        input.dispatchEvent(new Event('focus'));
        expect(input.value).toBe('1234.5');
        input.value = '2500.25';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('blur'));
        expect(f.componentInstance.amount.value).toBe(2500.25);
        expect(input.value).toBe('$ 2.500,25');
    });
    it('prevents letters in monetary input without blocking navigation keys', async () => {
        const f = TestBed.createComponent(MoneyHost);
        f.autoDetectChanges();
        await f.whenStable();
        const input = f.nativeElement.querySelector('input');
        input.value = '1';
        input.setSelectionRange(1, 1);
        const letter = new KeyboardEvent('keydown', {
            key: 'x',
            bubbles: true,
            cancelable: true,
        });
        input.dispatchEvent(letter);
        expect(letter.defaultPrevented).toBe(true);
        const arrow = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
            bubbles: true,
            cancelable: true,
        });
        input.dispatchEvent(arrow);
        expect(arrow.defaultPrevented).toBe(false);
    });
    it('requires two delete clicks and resets confirmation after an outside click', async () => {
        const f = TestBed.createComponent(EditSaveCancelComponent);
        f.autoDetectChanges();
        await f.whenStable();
        const remove = vi.spyOn(f.componentInstance.del, 'emit');
        const button = [...f.nativeElement.querySelectorAll('button')].find(
            (b: HTMLElement) => b.textContent.includes('Eliminar'),
        );
        button.click();
        expect(remove).not.toHaveBeenCalled();
        document.body.click();
        button.click();
        expect(remove).not.toHaveBeenCalled();
        button.click();
        expect(remove).toHaveBeenCalledOnce();
    });
    it('emits edit, save and cancel according to the current editing state', async () => {
        const f = TestBed.createComponent(EditSaveCancelComponent);
        f.autoDetectChanges();
        await f.whenStable();
        const edit = vi.spyOn(f.componentInstance.edit, 'emit');
        const save = vi.spyOn(f.componentInstance.save, 'emit');
        const cancel = vi.spyOn(f.componentInstance.cancel, 'emit');
        f.nativeElement.querySelector('button').click();
        expect(edit).toHaveBeenCalledOnce();
        f.componentRef.setInput('isEditing', true);
        await f.whenStable();
        f.nativeElement.querySelector('button').click();
        expect(save).toHaveBeenCalledOnce();
        [...f.nativeElement.querySelectorAll('button')]
            .find((b: HTMLElement) => b.textContent.includes('Cancelar'))
            .click();
        expect(cancel).toHaveBeenCalledOnce();
    });
    it.each([
        [1000, '1 segundo'],
        [2000, '2 segundos'],
        [60000, '1 minuto'],
        [120000, '2 minutos'],
        [3600000, '1 hora'],
        [7200000, '2 horas'],
        [86400000, '1 dia'],
        [172800000, '2 dias'],
    ])('formats elapsed time %s', (elapsed, expected) => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-10-09T12:00:00Z'));
        expect(
            new TimeElapsedPipe().transform(new Date(Date.now() - elapsed)),
        ).toBe(expected);
    });
    it('creates a valid trade-in device from model, color, capacity and IMEI', async () => {
        const t = dialogTest(FastAddDeviceComponent);
        await t.render();
        expect(t.component.isValid()).toBe(false);
        t.component.form.controls.model.setValue(model);
        t.http.expectOne('/api/devices/models/1').flush(model);
        t.component.toggleColor(1);
        t.component.toggleStorageSize(1);
        t.component.form.patchValue({
            batteryHealth: 85,
            imei: '123456789012345',
        });
        expect(t.component.isValid()).toBe(true);
        expect(t.component.parsedLabel).toBe('iPhone 8 Gold 64 GB 85% (2345)');
        expect(t.component.createDevice).toEqual(
            expect.objectContaining({
                modelId: 1,
                colorId: 1,
                storageSizeId: 1,
                condition: 'used',
                batteryHealth: 85,
            }),
        );
        t.component.form.controls.imei.setValue(null);
        t.component.form.controls.model.setValue(null);
        expect(t.component.isValid()).toBe(false);
        t.http.verify();
    });
    it('only returns selected recommended accessories with their quantities', async () => {
        const t = dialogTest(RecommendedAccesoriesComponent, {
            accesories: [product, { ...product, id: 2, stock: 0 }],
        });
        await t.render();
        t.component.options[0].quantity = 2;
        t.component.addRecommendedAccesories();
        expect(t.ref.close).toHaveBeenCalledWith([
            expect.objectContaining({ id: 1, quantity: 2 }),
        ]);
        t.http.verify();
    });
});
