import {
    animate,
    style,
    transition,
    trigger,
    state,
} from '@angular/animations';

export const rotate180deg = trigger(`rotate180deg`, [
    state('open', style({ transform: 'rotate(180deg)' })),
    state('close', style({ transform: 'rotate(0deg)' })),
    transition('open <=> close', animate('0.2s ease-in-out')),
]);
