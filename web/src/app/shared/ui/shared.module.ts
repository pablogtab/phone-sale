import {
    DEFAULT_DIALOG_CONFIG,
    DialogConfig,
    DialogModule,
} from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CheckboxComponent } from './checkbox/checkbox.component';
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';
import { EditSaveCancelComponent } from './edit-save-cancel/edit-save-cancel.component';
import { FormErrorMessageComponent } from './form-error-message/form-error-message.component';
import { GoBackComponent } from './go-back/go-back.component';
import { IconComponent } from './icon/icon.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { SearchObjectComponent } from './search-object/search-object.component';
import { SearchTermComponent } from './search-term/search-term.component';
import { SelectableOptionComponent } from './selectable/selectable-option/selectable-option.component';
import { SelectableComponent } from './selectable/selectable.component';
import { ToggleComponent } from './toggle/toggle.component';
import { ChipsModule } from './chips/chips.module';
import { CurrencyMaskDirective } from '../directives/currency-mask.directive';

const dialogConfig: DialogConfig = {
    panelClass: 'dialog-panel',
    hasBackdrop: true,
    restoreFocus: true,
    autoFocus: false,
};

@NgModule({
    declarations: [],
    imports: [
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        IconComponent,
        SelectableComponent,
        SelectableOptionComponent,
        ToggleComponent,
        CheckboxComponent,
        SearchTermComponent,
        GoBackComponent,
        EditSaveCancelComponent,
        PaginatorComponent,
        DialogHeaderComponent,
        SearchObjectComponent,
        FormErrorMessageComponent,
        CdkMenu,
        CdkMenuItem,
        CdkMenuTrigger,
        ChipsModule,
        CurrencyMaskDirective,
    ],
    exports: [
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        IconComponent,
        SelectableComponent,
        SelectableOptionComponent,
        ToggleComponent,
        CheckboxComponent,
        SearchTermComponent,
        GoBackComponent,
        EditSaveCancelComponent,
        PaginatorComponent,
        DialogModule,
        DialogHeaderComponent,
        SearchObjectComponent,
        FormErrorMessageComponent,
        CdkMenu,
        CdkMenuItem,
        CdkMenuTrigger,
        ChipsModule,
        CurrencyMaskDirective,
    ],
    providers: [{ provide: DEFAULT_DIALOG_CONFIG, useValue: dialogConfig }],
})
export class SharedModule {}
