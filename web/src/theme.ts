import { definePreset } from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';

export const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#f0f7ef',
            100: '#e1eddb',
            200: '#c5dabb',
            300: '#a2c199',
            400: '#7fa977',
            500: '#568956',
            600: '#3d7045',
            700: '#285b3b',
            800: '#194f3d',
            900: '#173e34',
            950: '#0d2923',
        },
    },
});
