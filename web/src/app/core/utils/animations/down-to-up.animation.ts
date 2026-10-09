import { animate, style, transition, trigger } from '@angular/animations';

// Compare this snippet from src/app/utils/animations/in-out.animation.ts:
export const downToUpAnimation = trigger(`downToUpAnimation`, [
    transition(':enter', [
        style({ transform: 'translateY(50%)', opacity: 0 }),
        animate(
            '0.2s ease-in-out',
            style({ transform: 'translateY(0)', opacity: 1 }),
        ),
    ]),
    transition(':leave', [
        animate(
            '0.2s ease-in-out',
            style({ transform: 'translateY(50%)', opacity: 0 }),
        ),
    ]),
]);
