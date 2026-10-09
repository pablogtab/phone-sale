import { Directive } from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

/** Own the internal control; never subscribe to and mutate the parent control. */
@Directive({})
export class ControlValueAccessorDirective<T> implements ControlValueAccessor {
  readonly control = new FormControl<T>(null);
  readonly destroy$ = new Subject<void>();
  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};
  constructor() {
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.onChange(value);
      this.onTouched();
    });
  }
  writeValue(value: T) { this.control.setValue(value, { emitEvent: false }); }
  registerOnChange(fn: (value: T) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(disabled: boolean) {
    disabled ? this.control.disable({ emitEvent: false }) : this.control.enable({ emitEvent: false });
  }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
