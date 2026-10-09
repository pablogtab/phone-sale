import {
    Directive,
    ElementRef,
    Input,
    OnChanges,
    Renderer2,
    SimpleChanges,
} from '@angular/core';

@Directive({
    selector: '[balanceColor]',
})
export class BalanceColorDirective implements OnChanges {
    @Input() value!: number;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
    ) {}

    ngOnChanges(): void {
        this.updateTextColor();
    }

    private updateTextColor(): void {
        let color = '';
        color =
            this.value > 0 ? '#33FF33' : this.value < 0 ? '#FF3333' : 'white';
        this.renderer.setStyle(this.el.nativeElement, 'color', color);
    }
}
