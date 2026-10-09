import {
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    Renderer2,
} from '@angular/core';

@Directive({
    selector: 'chip',
})
export class ChipDirective<T> {
    @Input() value: T;
    @Output() onSelected = new EventEmitter<T>();
    constructor(
        public el: ElementRef,
        public renderer: Renderer2,
    ) {
        this.renderer.addClass(this.el.nativeElement, 'chip');
        this.renderer.listen(this.el.nativeElement, 'click', () => {
            this.onSelected.emit(this.value);
        });
    }

    setAsSelected(condition: boolean) {
        if (condition) {
            this.renderer.addClass(this.el.nativeElement, 'selected');
        } else {
            this.renderer.removeClass(this.el.nativeElement, 'selected');
        }
    }

    setAsDisabled(condition: boolean) {
        if (condition) {
            this.renderer.addClass(this.el.nativeElement, 'disabled');
        } else {
            this.renderer.removeClass(this.el.nativeElement, 'disabled');
        }
    }
}
