import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipsComponent } from './chips.component';
import { ChipDirective } from './chip.directive';

@NgModule({
    declarations: [],
    imports: [ChipsComponent, ChipDirective, CommonModule],
    exports: [ChipsComponent, ChipDirective],
})
export class ChipsModule {}
