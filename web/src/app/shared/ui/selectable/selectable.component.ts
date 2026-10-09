import { collapsableOpen } from '@/app/core/utils/animations/collapsable-open.animation';
import { rotate180deg } from '@/app/core/utils/animations/rotate-180deg.animation';
import {
    Component,
    ContentChildren,
    ElementRef,
    HostListener,
    Input,
    QueryList,
    signal,
    SimpleChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { IconComponent } from '../icon/icon.component';
import { SelectableOptionComponent } from './selectable-option/selectable-option.component';

@Component({
    selector: 'selectable',
    imports: [IconComponent, ReactiveFormsModule],
    templateUrl: './selectable.component.html',
    animations: [collapsableOpen, rotate180deg],
    styleUrl: './selectable.component.css',
})
export class SelectableComponent<T> {
    @Input() config!: SelectableConfig<T>;
    @ContentChildren(SelectableOptionComponent) options!: QueryList<
        SelectableOptionComponent<T>
    >;
    @Input() value = new FormControl(null);

    constructor(private element: ElementRef) {}

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.value.registerOnDisabledChange((isDisabled) => {
            if (isDisabled) {
                this.filter.disable({ emitEvent: false });
            } else {
                this.filter.enable({ emitEvent: false });
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.

        if (changes['config']) {
            this.config = changes['config'].currentValue;
        }
    }

    open = signal(false);

    get isOpen() {
        return this.open();
    }

    filter = new FormControl('');

    @HostListener('document:click', ['$event']) clickOutside(
        event: MouseEvent,
    ) {
        if (
            event.target !== this.element.nativeElement &&
            !this.element.nativeElement.contains(event.target)
        ) {
            this.open.set(false);
        }
    }

    ngAfterViewInit(): void {
        this.value.valueChanges.subscribe((value) => {
            this.filter.setValue(this.safeGetLabel(value));
        });

        if (this.value.value) {
            this.filter.setValue(this.safeGetLabel(this.value.value));
        }
    }

    clear() {
        this.value.setValue(null as T);
        this.filter.setValue('');
    }

    onBlur() {
        this.open.set(false);
    }

    onFocus() {
        this.open.set(true);
    }

    onSelected(value: T) {
        this.value.setValue(value);
        this.open.set(false);
    }

    get list() {
        return this.options.toArray();
    }

    get filteredList() {
        if (this.value.value) {
            return this.list;
        }
        return this.list.filter((option) =>
            this.safeGetLabel(option.value)
                .toLowerCase()
                .includes((this.filter.value ?? '').toLowerCase()),
        );
    }

    onKeyDown(event: Event) {
        event.stopPropagation();
        const inputEvent = event as KeyboardEvent;
        const target = inputEvent.target as HTMLInputElement;

        this.open.set(true);

        if (inputEvent.key === 'ArrowDown') {
            event.preventDefault();
            return;
            // this.list[0].focus();
        }

        if (inputEvent.key === 'ArrowUp') {
            event.preventDefault();
            return;
        }

        if (inputEvent.key === 'Enter') {
            return;
        }

        if (inputEvent.key === 'Escape') {
            return;
        }

        if (this.value.value) {
            const label = this.safeGetLabel(this.value.value);
            target.value = label;
            this.value.setValue(null as T);
            this.filter.setValue(label);
            return;
        }
    }

    safeGetLabel(value: T) {
        return this.config?.parseLabel(value ?? ({} as T)) ?? '';
    }
}

export interface SelectableConfig<T> {
    parseLabel: (value: T) => string;
}
