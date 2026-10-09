import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs, 'es-AR');
import { vi, afterEach } from 'vitest';
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => ({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    })),
});
window.scrollTo = vi.fn();
HTMLElement.prototype.scrollIntoView = vi.fn();
afterEach(() => {
    document.body
        .querySelectorAll('.p-overlay, .cdk-overlay-container')
        .forEach((element) => element.remove());
});
