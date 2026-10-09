import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    constructor() {}

    selectFile<T extends File | File[] = File | File[]>(
        opts?: SelectFileOptions,
    ): Promise<T | null> {
        const accept = opts?.accept || 'image/*';
        const multiple = opts?.multiple || false;

        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = multiple;
            input.onchange = () => {
                if (!input.files) {
                    resolve(null);
                    return;
                }
                resolve(
                    multiple
                        ? (Array.from(input.files) as T)
                        : (input.files[0] as T),
                );
            };
            input.click();

            input.oncancel = () => {
                resolve(null);
            };
        });
    }
}

type SelectFileOptions = {
    accept?: string;
    multiple?: boolean;
};
