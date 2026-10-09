import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import {
    provideHttpClientTesting,
    HttpTestingController,
} from '@angular/common/http/testing';
import { vi } from 'vitest';
import { SearchObjectComponent } from './search-object.component';

@Injectable()
class SearchApi {
    constructor(private http: HttpClient) {}
    search(query: string) {
        return this.http.get<{ id: number; name: string }[]>(
            `/test-search?${query}`,
        );
    }
    get(id: number) {
        return this.http.get<{ id: number; name: string }>(
            `/test-search/${id}`,
        );
    }
}
describe('entity selector requests', () => {
    let http: HttpTestingController;
    beforeEach(() => {
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })),
        );
        vi.useFakeTimers();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                SearchApi,
            ],
        });
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
        http.verify();
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });
    function screen() {
        const fixture = TestBed.createComponent(
            SearchObjectComponent<{ id: number; name: string }>,
        );
        fixture.componentInstance.config = {
            service: SearchApi,
            displayWith: (value) => value.name,
        };
        fixture.detectChanges();
        return fixture;
    }
    it('debounces typing and URL-encodes the search text', () => {
        const component = screen().componentInstance;
        component.search('i');
        vi.advanceTimersByTime(100);
        component.search('iPhone & Pro');
        vi.advanceTimersByTime(180);
        const request = http.expectOne('/test-search?query=iPhone+%26+Pro');
        request.flush([{ id: 1, name: 'iPhone Pro' }]);
        expect(component.options()).toEqual([{ id: 1, name: 'iPhone Pro' }]);
        expect(component.loading()).toBe(false);
    });
    it('cancels old results so they cannot replace the latest selection list', () => {
        const component = screen().componentInstance;
        component.search('old');
        vi.advanceTimersByTime(180);
        const old = http.expectOne('/test-search?query=old');
        component.search('new');
        vi.advanceTimersByTime(180);
        expect(old.cancelled).toBe(true);
        http.expectOne('/test-search?query=new').flush([
            { id: 2, name: 'Latest' },
        ]);
        expect(component.options()[0].name).toBe('Latest');
    });
    it('recovers after a failed request without mutating domain objects', () => {
        const component = screen().componentInstance;
        component.search();
        vi.advanceTimersByTime(180);
        http.expectOne('/test-search?').flush(
            {},
            { status: 500, statusText: 'Failed' },
        );
        expect(component.failed()).toBe(true);
        expect(component.options()).toEqual([]);
        component.search('retry');
        vi.advanceTimersByTime(180);
        const value = { id: 3, name: 'Recovered' };
        http.expectOne('/test-search?query=retry').flush([value]);
        expect(component.failed()).toBe(false);
        expect(component.displayLabel(component.options()[0])).toBe(
            'Recovered',
        );
        expect(Object.keys(component.options()[0])).toEqual(['id', 'name']);
    });
    it('opens the dropdown when async suggestions arrive', () => {
        const fixture = screen();
        const input = fixture.nativeElement.querySelector('input');
        input.value = 'iPhone';
        input.dispatchEvent(new Event('input'));
        vi.advanceTimersByTime(180);
        const request = http.expectOne('/test-search?query=iPhone');
        fixture.detectChanges();
        request.flush([{ id: 8, name: 'iPhone 8 Plus' }]);
        fixture.detectChanges();
        vi.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(document.body.textContent).toContain('iPhone 8 Plus');
        expect(document.body.querySelector('[role="option"]')).toBeTruthy();
        fixture.destroy();
    });
    it('cancels pending requests when the screen is destroyed', () => {
        const fixture = screen();
        fixture.componentInstance.search('pending');
        vi.advanceTimersByTime(180);
        const request = http.expectOne('/test-search?query=pending');
        fixture.destroy();
        expect(request.cancelled).toBe(true);
    });
});
