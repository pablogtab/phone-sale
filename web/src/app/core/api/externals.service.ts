import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ExternalsService {
    constructor() {}

    openWhatsapp(phone: string) {
        window.open(`https://wa.me/${phone}`, '_blank');
    }

    openInstagram(username: string) {
        window.open(`https://instagram.com/${username}`, '_blank');
    }
}
