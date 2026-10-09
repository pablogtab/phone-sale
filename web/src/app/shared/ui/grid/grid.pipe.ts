import { Pipe, PipeTransform } from '@angular/core';

import { AvailableGridPipe } from './grid.component';
import { CurrencyPipe } from '@angular/common';

@Pipe({
    name: 'gridPipe',
})
export class GridPipe implements PipeTransform {
    transform(value: string, pipe?: AvailableGridPipe | undefined): string {
        switch (pipe) {
            case 'currency':
                return new CurrencyPipe('es-AR', ' ').transform(value);
            default:
                return value;
        }
    }
}
