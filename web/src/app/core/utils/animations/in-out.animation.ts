import {
    trigger,
    state,
    style,
    animate,
    transition,
} from '@angular/animations';

export const inOutAnimation_03 = trigger(`inOutAnimation-0.3`, [
    state('in', style({ opacity: 0.3 })),
    transition(':enter', [style({ opacity: 0 }), animate('0.2s ease-in-out')]),
    transition(':leave', animate('0.2s', style({ opacity: 0 }))),
]);
