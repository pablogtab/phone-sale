import { ControlValueAccessorDirective } from './control-value-accessor.directive';
import { vi } from 'vitest';

describe('custom form control', () => {
    it('writes parent values without recursively emitting changes', () => {
        const control = new ControlValueAccessorDirective<boolean>();
        const changed = vi.fn();
        control.registerOnChange(changed);
        control.writeValue(true);
        expect(control.control.value).toBe(true);
        expect(changed).not.toHaveBeenCalled();
        control.control.setValue(false);
        expect(changed).toHaveBeenCalledExactlyOnceWith(false);
        control.ngOnDestroy();
    });
    it('changes disabled state without submitting a value and stops after destruction', () => {
        const control = new ControlValueAccessorDirective<boolean>();
        const changed = vi.fn();
        control.registerOnChange(changed);
        control.setDisabledState(true);
        expect(control.control.disabled).toBe(true);
        control.setDisabledState(false);
        expect(changed).not.toHaveBeenCalled();
        control.ngOnDestroy();
        control.control.setValue(true);
        expect(changed).not.toHaveBeenCalled();
    });
});
