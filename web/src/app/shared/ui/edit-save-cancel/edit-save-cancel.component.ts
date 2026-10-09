import { inOutAnimation_03 } from '@/app/core/utils/animations/in-out.animation';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'edit-save-cancel',
    imports: [IconComponent],
    animations: [inOutAnimation_03],
    templateUrl: './edit-save-cancel.component.html',
    styleUrl: './edit-save-cancel.component.css',
})
export class EditSaveCancelComponent {
    @Input() hideDelete: boolean = false;
    @Input() isEditing: boolean;
    @Output() save = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
    @Output() edit = new EventEmitter<void>();
    @Output() del = new EventEmitter<void>();

    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        if (this.el.nativeElement.contains(event.target)) {
            return;
        }
        this.delTimes = 0;
    }

    delTimes = 0;

    constructor(private el: ElementRef) {}

    editToggle() {
        this.delTimes = 0;
        if (this.isEditing) {
            this.save.emit();
        } else {
            this.edit.emit();
        }
    }

    handleDel() {
        if (this.delTimes > 0) {
            this.del.emit();
            this.delTimes = 0;
        }
        this.delTimes++;
    }
}
