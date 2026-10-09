import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class FilterService<Filter> {
    constructor(private router: Router) {}

    saveStateToUrl(params: Optional<Filter>) {
        const currentParams = this.getParamsFromUrl();

        Object.keys(params).forEach((key: any) => {
            let filterKey = key as keyof Filter;
            currentParams[filterKey] = params[filterKey];
        });

        Object.keys(currentParams).forEach((key: any) => {
            let filterKey = key as keyof Filter;

            if (typeof currentParams[filterKey] === 'string') {
                if (!currentParams[filterKey]) {
                    delete currentParams[filterKey];
                }
            }
        });

        this.router.navigate([], {
            queryParams: currentParams,
            queryParamsHandling: '',
            replaceUrl: true,
        });
    }

    getParamsFromUrl() {
        return this.router.parseUrl(this.router.url)
            .queryParams as Optional<Filter>;
    }
}

type Optional<T> = {
    [P in keyof T]?: T[P];
};
