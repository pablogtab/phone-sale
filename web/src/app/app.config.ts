import {
    ApplicationConfig,
    LOCALE_ID,
    provideZoneChangeDetection,
} from '@angular/core';
import {
    provideRouter,
    withComponentInputBinding,
    withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideOptimus } from '@openng/optimus-ui/config';
import { MyPreset } from '@/theme';

registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(
            routes,
            withInMemoryScrolling({
                scrollPositionRestoration: 'top',
            }),
            withComponentInputBinding(),
        ),
        provideHttpClient(withInterceptors([authInterceptor])),
        {
            provide: LOCALE_ID,
            useValue: 'es-AR',
        },
        provideAnimationsAsync(),
        provideOptimus({
            theme: {
                preset: MyPreset,
                options: { darkModeSelector: false },
            },
        }),
    ],
};
