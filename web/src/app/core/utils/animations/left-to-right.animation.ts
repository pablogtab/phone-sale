import { animate, style, transition, trigger } from '@angular/animations';

export const leftToRightAnimation = trigger(`leftToRightAnimation`, [
    transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.2s ease-in-out', style({ transform: 'translateX(0)' })),
    ]),
    transition(':leave', [
        animate('0.2s ease-in-out', style({ transform: 'translateX(-100%)' })),
    ]),
]);
