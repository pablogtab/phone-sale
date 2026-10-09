import { collapsableOpen } from '@/app/core/utils/animations/collapsable-open.animation';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'form-error-message',
    imports: [],
    animations: [collapsableOpen],
    templateUrl: './form-error-message.component.html',
})
export class FormErrorMessageComponent {
    @Input() message: string;
}
