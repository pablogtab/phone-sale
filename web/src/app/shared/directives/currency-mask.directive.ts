import {
    AfterViewInit,
    Directive,
    ElementRef,
    HostListener,
    Input,
    Optional,
    Renderer2,
} from '@angular/core';
import { NgControl, NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
    selector: 'input[currencyMask]',
})
export class CurrencyMaskDirective implements AfterViewInit {
    @Input('currencyDecimals') decimals: number = 2;
    @Input('currencyPrefix') prefix: string = '$';

    private ngModelSubscription: Subscription;
    private ngControlSubscription: Subscription;

    constructor(
        private el: ElementRef<HTMLInputElement>,
        private renderer: Renderer2,
        @Optional() private ngModel: NgModel,
        @Optional() private ngControl: NgControl,
    ) {
        if (this.el.nativeElement.type !== 'text') {
            throw new Error(
                'CurrencyMaskDirective should be used only in input type="text" elements',
            );
        }
    }

    ngAfterViewInit(): void {
        const initial = this.ngControl?.control?.value ?? this.ngModel?.model;
        if (typeof initial === 'number') {
            this.el.nativeElement.value = String(initial);
            this.onBlur();
        }
        this.ngModelSubscription = this.ngModel?.valueChanges.subscribe(
            (value) => {
                if (typeof value === 'number') {
                    this.el.nativeElement.value = '$ ' + value;
                    this.onBlur();
                }
            },
        );

        this.ngControlSubscription = this.ngControl?.valueChanges.subscribe(
            (value) => {
                if (typeof value === 'number') {
                    this.el.nativeElement.value = '$ ' + value;
                    this.onBlur();
                }
            },
        );
    }

    ngOnDestroy(): void {
        // Unsubscribe from NgModel and NgControl subscriptions to avoid memory leaks
        if (this.ngModelSubscription) {
            this.ngModelSubscription.unsubscribe();
        }
        if (this.ngControlSubscription) {
            this.ngControlSubscription.unsubscribe();
        }
    }

    @HostListener('focus') onFocus() {
        const value = this.parseValue(this.el.nativeElement.value);
        this.renderer.setProperty(this.el.nativeElement, 'value', value);
        this.el.nativeElement.select();
    }

    @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
        const currentValue = this.el.nativeElement.value;
        if (event.key.length > 1) {
            return;
        }
        const selectionStart = this.el.nativeElement.selectionStart;
        const selectionEnd = this.el.nativeElement.selectionEnd;
        const newValue =
            currentValue.slice(0, selectionStart) +
            event.key +
            currentValue.slice(selectionEnd);

        const isValidNumber = this.isValidNumber(newValue);

        if (!isValidNumber) {
            event.preventDefault();
        }
    }

    @HostListener('blur') onBlur() {
        const value = this.el.nativeElement.value;
        let formattedValue = this.formatCurrency(value);

        if (this.ngModel) {
            const ngModelValue = this.ngModel?.model;
            if (typeof ngModelValue === 'string') {
                const parsedValue = this.parseValue(formattedValue);
                this.ngModel.update.emit(parsedValue);
            }
        }

        if (this.ngControl) {
            const ngControlValue = this.ngControl.control.value;
            if (typeof ngControlValue === 'string') {
                const parsedValue = this.parseValue(formattedValue);
                this.ngControl.control.setValue(parsedValue, {
                    emitEvent: false,
                });
            }
        }

        this.renderer.setProperty(
            this.el.nativeElement,
            'value',
            formattedValue,
        );
    }

    private formatCurrency(value: string): string {
        let numberValue = parseFloat(value.replace(/[^\d-.]/g, ''));
        let integer =
            numberValue > 0 ? Math.floor(numberValue) : Math.ceil(numberValue);
        let decimals = Math.abs(
            Math.round((numberValue - integer) * Math.pow(10, this.decimals)),
        );

        if (isNaN(numberValue)) {
            numberValue = 0;
            integer = 0;
            decimals = 0;
        }

        const formattedInteger = integer
            .toLocaleString('en-US')
            .replace(/[,]/g, '.');
        const formattedDecimals = decimals
            .toString()
            .padStart(this.decimals, '0');

        return this.prefix + ' ' + formattedInteger + ',' + formattedDecimals;
    }

    private isValidNumber(value: string): boolean {
        if (value === '-') return true;

        let reg = new RegExp(
            `^-?\\d+${this.decimals ? '\\.?' : ''}(\\d{0,${this.decimals}})?$`,
        );
        return reg.test(value);
    }

    private parseValue(value: string): number {
        const valorLimpio = value.replace(/[^\d-,]/g, '');
        const valorNumerico = parseFloat(valorLimpio.replace(',', '.'));
        return isNaN(valorNumerico) ? 0 : valorNumerico;
    }
}
