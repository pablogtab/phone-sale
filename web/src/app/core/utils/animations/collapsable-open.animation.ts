import { animate, style, transition, trigger } from '@angular/animations';

// Compare this snippet from src/app/utils/animations/in-out.animation.ts:
export const collapsableOpen = trigger(`collapsableOpen`, [
    transition(':enter', [
        style({ transform: 'scaleY(0)', opacity: 0 }),
        animate(
            '0.2s ease-in-out',
            style({ transform: 'scaleY(1)', opacity: 1 }),
        ),
    ]),
    transition(':leave', [
        animate(
            '0.2s ease-in-out',
            style({ transform: 'scaleY(0)', opacity: 0 }),
        ),
    ]),
]);
