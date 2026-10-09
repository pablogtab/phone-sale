import { Component, EventEmitter, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'paginator',
    imports: [IconComponent],
    templateUrl: './paginator.component.html',
    styleUrl: './paginator.component.css',
})
export class PaginatorComponent {
    page = 1;
    pageSize = 10;
    totalPages = 0;

    @Output() pageChange = new EventEmitter<number>();

    constructor() {}

    nextPage() {
        if (this.page < this.totalPages) {
            this.page++;
            this.pageChange.emit(this.page);
        }
    }

    prevPage() {
        if (this.page > 1) {
            this.page--;
            this.pageChange.emit(this.page);
        }
    }

    goToPage(page: number) {
        if (page === null) return;
        if (page > 0 && page <= this.totalPages) {
            this.page = page;
            this.pageChange.emit(this.page);
        }
    }

    get renderBoxes() {
        const boxes: Box[] = [];

        const total = this.totalPages;

        if (total <= 5) {
            for (let i = 1; i <= total; i++) {
                boxes.push({ number: i, period: false });
            }
        } else {
            boxes.push({ number: 1, period: false });
            if (this.page > 3) {
                boxes.push({ number: null, period: true });
            } else {
                boxes.push({ number: 2, period: false });
            }

            if (this.page <= 3) {
                boxes.push({ number: 3, period: false });
            }

            if (this.page > 3 && this.page < total - 2) {
                boxes.push({ number: this.page, period: false });
            }

            if (this.page >= total - 2) {
                boxes.push({ number: total - 2, period: false });
            }

            if (this.page < total - 2) {
                boxes.push({ number: null, period: true });
            } else {
                boxes.push({ number: total - 1, period: false });
            }

            boxes.push({ number: total, period: false });
        }

        return boxes;
    }
}

type Box = {
    number: number;
    period: boolean;
};
