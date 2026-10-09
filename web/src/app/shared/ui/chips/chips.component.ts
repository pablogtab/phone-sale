import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { ControlValueAccessorDirective } from '@/app/shared/directives/control-value-accessor.directive';
import {
    Component,
    ContentChildren,
    forwardRef,
    Input,
    QueryList,
    ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ChipDirective } from './chip.directive';

@Component({
    selector: 'chips',
    imports: [],
    styleUrls: ['./chips.component.css'],
    templateUrl: './chips.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ChipsComponent),
            multi: true,
        },
    ],
})
export class ChipsComponent<T> extends ControlValueAccessorDirective<T | T[]> {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    @ContentChildren(ChipDirective) chips: QueryList<ChipDirective<T>>;

    @Input() multiple = false;

    suscriptions: Subscription[] = [];

    ngAfterViewInit(): void {
        this.control.valueChanges
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((value) => {
                this.markSelectedChips(value);
                this.markChipsAsDisabled(this.control.disabled);
            });

        this.markSelectedChips(this.control.value);
        this.markChipsAsDisabled(this.control.disabled);
    }

    ngAfterContentChecked(): void {
        if (this.noChangesInChips()) return;
        this.suscriptions.forEach((sub) => sub.unsubscribe());
        this.suscriptions = this.chips.map((chip) =>
            chip.onSelected
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe((value) => this.onChipSelected(value)),
        );
    }

    noChangesInChips(): boolean {
        return this.suscriptions.length === this.chips.length;
    }

    onChipSelected(value: T) {
        if (this.control.disabled) return;
        if (this.multiple) {
            this.control?.setValue([...(this.control?.value as T[]), value]);
        } else {
            this.control?.setValue(value);
        }
    }

    markSelectedChips(value: T | T[]) {
        if (this.control.disabled) return;

        this.chips.forEach((chip) => {
            chip.setAsSelected(false);
            if (this.multiple) {
                if ((value as T[]).includes(chip.value)) {
                    chip.setAsSelected(true);
                }
            } else {
                if (chip.value === value) {
                    chip.setAsSelected(true);
                }
            }
        });
    }

    markChipsAsDisabled(disabled: boolean) {
        this.chips.forEach((chip) => chip.setAsDisabled(disabled));
    }
}

export interface ChipConfig {
    options: string[];
    multiple?: boolean;
}
