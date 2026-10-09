import { environment } from '@/environments';
import { DataSource } from '@angular/cdk/collections';
import { CdkMenuModule } from '@angular/cdk/menu';
import { CdkTableModule } from '@angular/cdk/table';
import {
    Component,
    EventEmitter,
    Input,
    Output,
    SimpleChanges,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IconComponent, IconName } from '../icon/icon.component';
import { GridPipe } from './grid.pipe';

@Component({
    selector: 'grid',
    imports: [CdkTableModule, GridPipe, CdkMenuModule, IconComponent],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.css',
})
export class GridComponent<T> {
    baseFileUrl = environment.filesUrl;
    displayedColumns: string[] = [];
    footerMap: { [key: string]: GridFooter<T> } = {};
    footers: GridFooter<T>[] = [];
    columns: GridColumn<T>[] = [];
    actions: GridAction<T>[] = [];
    @Input() data: GridDataSource<T>;
    @Input() config: GridConfig<T>;
    @Output() action = new EventEmitter<{
        event: string;
        row: T;
        index: number;
    }>();

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['config']) {
            this.displayedColumns = this.config.columns.map((c) => c.name);
            if (this.config.actions && this.config.actions.length > 0) {
                this.actions = this.config.actions;
                this.displayedColumns = [...this.displayedColumns, 'actions'];
                this.actions.forEach((a) => {
                    a.disabled = a.disabled || (() => false);
                });
            }

            this.columns = this.config.columns.map((c) => ({
                ...c,
                get: c.field ? (row: T) => row[c.field] : c.get,
            }));

            if (this.config.footers) {
                this.footers = this.config.footers;
                this.footerMap = {};
                this.config.footers.forEach(
                    (f) => (this.footerMap[f.position] = f),
                );
            }

            this.headerColumn.header = true;
        }

        if (changes['data']) {
            this.data = this.data || new GridDataSource<T>();
        }
    }

    executeAction(event: string, row: T, index: number) {
        this.action.emit({ event, row, index });
    }

    get headerColumn() {
        return this.columns.find((c) => c.header) ?? this.columns[0];
    }

    get nonHeaderColumns() {
        return this.columns.filter((c) => !c.header);
    }
}

export class GridDataSource<T> implements DataSource<T> {
    private obs: BehaviorSubject<T[]>;
    private data: T[] = [];

    constructor(data: T[] = []) {
        this.data = data;
        this.obs = new BehaviorSubject<T[]>(this.data);
    }

    connect(): Observable<T[]> {
        return this.obs;
    }

    disconnect() {}

    push(data: T) {
        this.data.push(data);
        this.emit();
    }

    remove(index: number, quantity: number = 1) {
        this.data.splice(index, quantity);
        this.emit();
    }

    emit() {
        this.obs.next(this.data);
    }

    get length() {
        return this.data.length;
    }

    get array() {
        return this.data;
    }

    set array(data: T[]) {
        this.data = data;
        this.emit();
    }
}

export interface GridConfig<T> {
    columns: GridColumn<T>[];
    actions?: GridAction<T>[];
    footers?: GridFooter<T>[];
}

export type GridColumn<T> = {
    name: string;
    img?: {
        imgGetUrl: (row: T) => string;
    };
    header?: boolean;
    pipe?: AvailableGridPipe;
    get?: (row: T) => any;
    field?: keyof T;
} & ({ field: keyof T } | { get: (row: T) => any });

export type GridAction<T> = {
    icon?: IconName;
    eventName: string;
    label: string;
    disabled?: (row: T) => boolean;
};

export type GridFooter<T> = {
    position: string;
    mobileLabel: string;
    pipe?: AvailableGridPipe;
    get: (rows: T[]) => any;
};

export type AvailableGridPipe = 'currency';
