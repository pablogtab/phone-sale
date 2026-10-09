import { Component, Input } from '@angular/core';

@Component({
    selector: 'selectable-option',
    imports: [],
    templateUrl: './selectable-option.component.html',
})
export class SelectableOptionComponent<T> {
    @Input() value!: T;
}
