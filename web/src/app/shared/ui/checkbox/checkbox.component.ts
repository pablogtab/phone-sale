import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    forwardRef,
    ChangeDetectorRef,
    inject,
} from '@angular/core';
import {
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    ControlValueAccessor,
} from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'checkbox',
    imports: [CommonModule, ReactiveFormsModule, IconComponent],
    templateUrl: './checkbox.component.html',
    styleUrls: ['./checkbox.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxComponent),
            multi: true,
        },
    ],
})
export class CheckboxComponent implements ControlValueAccessor {
    @Input() color: string = 'primary';
    @Input() label = 'Seleccionar opción';
    disabled = false;
    private readonly view = inject(ChangeDetectorRef);

    private _value: boolean = false;

    @Input()
    set checked(value: boolean) {
        this._value = value;
        this.view.markForCheck();
    }
    get checked(): boolean {
        return this._value;
    }

    writeValue(value: any): void {
        if (value !== undefined) {
            this._value = value;
            this.view.markForCheck();
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.view.markForCheck();
    }

    private onChange: any = () => {};
    private onTouched: any = () => {};

    toggleCheckbox() {
        if (this.disabled) return;
        this.onTouched();
        this._value = !this._value;
        this.onChange(this._value);
    }

    get value(): boolean {
        return this._value;
    }
}
