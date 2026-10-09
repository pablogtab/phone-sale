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
            this.value > 0 ? '#3c7046' : this.value < 0 ? '#b4483b' : 'var(--contrast-1)';
        this.renderer.setStyle(this.el.nativeElement, 'color', color);
    }
}
