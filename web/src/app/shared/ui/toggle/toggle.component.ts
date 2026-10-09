import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { ControlValueAccessorDirective } from '@/app/shared/directives/control-value-accessor.directive';
import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    Output,
} from '@angular/core';
import { takeUntil } from 'rxjs';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'toggle',
    imports: [CommonModule],
    templateUrl: './toggle.component.html',
    styleUrl: './toggle.component.css',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ToggleComponent),
            multi: true,
        },
    ],
})
export class ToggleComponent extends ControlValueAccessorDirective<boolean> {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    @Input() color: string = 'primary';
    @Input() label = 'Cambiar opción';

    @Output() change: EventEmitter<boolean> = new EventEmitter();

    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        this.control.valueChanges
            .pipe(takeUntil(this.destroy$))
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((value) => {
                this.change.emit(value);
            });
    }

    toggle() {
        if (this.control.disabled) return;
        this.control.setValue(!this.control.value);
    }
}
