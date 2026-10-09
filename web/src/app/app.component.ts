import { Component, inject } from '@angular/core';
import { StoreSettingsService } from './core/api/store-settings.service';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: '<router-outlet />',
})
export class AppComponent {
    private readonly store = inject(StoreSettingsService);
    ngOnInit() { void this.store.load(); }
}
