import { By } from '@angular/platform-browser';
import { AutoComplete } from '@openng/optimus-ui/autocomplete';
import { Component, inject, getDebugNode, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { EditDeviceComponent } from './edit-device.component';
import { model } from '@/testing/screen-fixtures';
import { overlayCompatibilityProvider } from '@/app/app.config';
@Component({
    imports: [DialogModule],
    template: '<button (click)="open()">Nuevo equipo</button>',
})
class DeviceDialogHost {
    dialog = inject(Dialog);
    open() {
        this.dialog.open(EditDeviceComponent, {
            data: { title: 'Nuevo equipo' },
            panelClass: 'dialog-panel',
        });
    }
}
describe('model selector inside the actual new-device dialog', () => {
    let http: HttpTestingController;
    const popoverDescriptor = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'showPopover',
    );
    beforeEach(() => {
        // Exercise the browser path: jsdom normally lacks the Popover API.
        Object.defineProperty(HTMLElement.prototype, 'showPopover', {
            configurable: true,
            value: () => {},
        });
        TestBed.configureTestingModule({
            providers: [
                overlayCompatibilityProvider,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                provideNoopAnimations(),
            ],
        });
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
        TestBed.inject(Dialog).closeAll();
        try {
            http.verify();
        } finally {
            TestBed.resetTestingModule();
            if (popoverDescriptor)
                Object.defineProperty(
                    HTMLElement.prototype,
                    'showPopover',
                    popoverDescriptor,
                );
            else delete HTMLElement.prototype['showPopover'];
        }
    });
    it('shows async results inside the dialog and selects a model without another interaction', async () => {
        const fixture = TestBed.createComponent(DeviceDialogHost);
        fixture.autoDetectChanges();
        fixture.nativeElement.querySelector('button').click();
        await fixture.whenStable();
        const input = document.body.querySelector(
            'device-model-search input',
        ) as HTMLInputElement;
        input.focus();
        input.value = 'ipho';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 210));
        http.expectOne(
            '/api/devices/models/search?query=ipho&active=true',
        ).flush([model, { ...model, id: 2, name: 'iPhone 8 Plus' }]);
        await fixture.whenStable();
        const option = [
            ...document.body.querySelectorAll('[role="option"]'),
        ].find((element) =>
            element.textContent.includes('iPhone 8'),
        ) as HTMLElement;
        expect(option).toBeTruthy();
        expect(option.closest('.cdk-overlay-container')).toBeTruthy();
        const opened = TestBed.inject(Dialog).openDialogs[0];
        const autocomplete = (
            getDebugNode(
                opened.componentRef.location.nativeElement,
            ) as DebugElement
        ).query(By.directive(AutoComplete)).componentInstance as AutoComplete;
        expect(autocomplete.overlayOptions.baseZIndex).toBeGreaterThan(1000);
        expect(opened.overlayRef.getConfig().usePopover).toBe(false);
        option.click();
        http.expectOne('/api/devices/models/1').flush(model);
        await fixture.whenStable();
        expect(input.value).toBe('iPhone 8');
        const dialog = TestBed.inject(Dialog).openDialogs[0];
        const component = dialog.componentInstance as EditDeviceComponent;
        expect(component.form.controls.model.value.id).toBe(1);
        expect(component.availableColors[0].name).toBe('Gold');
        expect(
            document.body.querySelector('.dialog-panel').textContent,
        ).toContain('64 GB');
    });
    it('shows an error inside the open selector and recovers on a later search', async () => {
        const fixture = TestBed.createComponent(DeviceDialogHost);
        fixture.autoDetectChanges();
        fixture.nativeElement.querySelector('button').click();
        await fixture.whenStable();
        const input = document.body.querySelector(
            'device-model-search input',
        ) as HTMLInputElement;
        input.focus();
        input.value = 'ipho';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 210));
        http.expectOne(
            '/api/devices/models/search?query=ipho&active=true',
        ).flush({}, { status: 503, statusText: 'Unavailable' });
        await fixture.whenStable();
        expect(document.body.textContent).toContain(
            'No pudimos cargar las opciones',
        );
        input.value = 'iphone';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 210));
        http.expectOne(
            '/api/devices/models/search?query=iphone&active=true',
        ).flush([model]);
        await fixture.whenStable();
        expect(
            document.body.querySelector('[role="option"]').textContent,
        ).toContain('iPhone 8');
    });
});
