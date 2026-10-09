import { Component, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Subject } from 'rxjs';
import { dialogTest } from '@/testing/dialog-test-bed';
import { PaginatorComponent } from './paginator/paginator.component';
import { EditObjectComponent } from './edit-object/edit-object.component';
import { HasPermissionDirective } from '../directives/has-permission.directive';
import { CurrentRoleService } from '@/app/core/auth/current-role.service';
import { applyFilters } from '@/app/core/utils/apply-filters';
import { rounding } from '@/app/core/utils/rounding';
import { refreshView } from '@/app/core/utils/refresh-view';
import { GridPipe } from './grid/grid.pipe';
@Component({
    imports: [HasPermissionDirective],
    template:
        "<button *hasPermission=\"{ permission: 'clients', actions: ['read', 'write'] }\">Editar cliente</button>",
})
class PermissionHost {}
describe('shared UI behavior', () => {
    afterEach(() => TestBed.resetTestingModule());
    it('does not show protected controls before a role is loaded', async () => {
        const f = TestBed.createComponent(PermissionHost);
        f.autoDetectChanges();
        await f.whenStable();
        expect(f.nativeElement.querySelector('button')).toBeNull();
    });
    it('updates protected controls on login, permission changes and logout', async () => {
        const f = TestBed.createComponent(PermissionHost);
        f.autoDetectChanges();
        const role = TestBed.inject(CurrentRoleService);
        role.setCurrentRole({ role: 'admin', permissions: {} });
        await f.whenStable();
        expect(f.nativeElement.textContent).toContain('Editar cliente');
        role.setCurrentRole({
            role: 'user',
            permissions: { clients: ['read'] },
        });
        await f.whenStable();
        expect(f.nativeElement.querySelector('button')).toBeNull();
        role.setCurrentRole({
            role: 'user',
            permissions: { clients: ['read', 'write'] },
        });
        await f.whenStable();
        expect(f.nativeElement.querySelectorAll('button')).toHaveLength(1);
        role.setCurrentRole(null);
        await f.whenStable();
        expect(f.nativeElement.querySelector('button')).toBeNull();
    });
    it('keeps pagination within bounds and emits valid navigation', () => {
        const p = new PaginatorComponent();
        p.totalPages = 6;
        const emit = vi.spyOn(p.pageChange, 'emit');
        p.prevPage();
        p.goToPage(0);
        p.goToPage(7);
        p.goToPage(null);
        expect(emit).not.toHaveBeenCalled();
        p.nextPage();
        expect(emit).toHaveBeenLastCalledWith(2);
        p.goToPage(6);
        p.nextPage();
        expect(p.page).toBe(6);
        p.prevPage();
        expect(emit).toHaveBeenLastCalledWith(5);
    });
    it.each([0, 1, 4, 5, 20])(
        'renders bounded page choices for %s pages',
        (total) => {
            const p = new PaginatorComponent();
            p.totalPages = total;
            for (let page = 1; page <= Math.max(1, total); page++) {
                p.page = page;
                const numbers = p.renderBoxes
                    .filter((box) => !box.period)
                    .map((box) => box.number);
                expect(numbers.every((n) => n >= 1 && n <= total)).toBe(true);
                expect(new Set(numbers).size).toBe(numbers.length);
                if (total) {
                    expect(numbers).toContain(1);
                    expect(numbers).toContain(total);
                    expect(numbers).toContain(page);
                }
            }
        },
    );
    it('preserves zero and false when opening editable labels', async () => {
        const t = dialogTest(EditObjectComponent, {
            title: 'Etiquetas',
            fields: [
                {
                    key: 'value',
                    label: 'Valor',
                    type: 'number',
                    required: true,
                },
                {
                    key: 'active',
                    label: 'Activo',
                    type: 'select',
                    required: true,
                    options: [],
                },
            ],
            initialValues: { value: 0, active: false },
            options: { skipQuestionAtSave: true },
        });
        await t.render();
        expect(t.component.form.getRawValue()).toEqual({
            value: 0,
            active: false,
        });
        await t.component.save();
        expect(t.ref.close).toHaveBeenCalledWith({ value: 0, active: false });
    });
    it('rejects blank required labels without opening a confirmation', async () => {
        const t = dialogTest(EditObjectComponent, {
            title: 'Etiqueta',
            fields: [
                { key: 'name', label: 'Nombre', type: 'text', required: true },
            ],
            initialValues: { name: '  ' },
        });
        await t.render();
        await t.component.save();
        expect(t.messages.error).toHaveBeenCalledOnce();
        expect(t.messages.question).not.toHaveBeenCalled();
        expect(t.ref.close).not.toHaveBeenCalled();
    });
    it('cancel leaves labels unchanged and returns null', async () => {
        const t = dialogTest(EditObjectComponent, {
            title: 'Etiqueta',
            fields: [{ key: 'name', label: 'Nombre', type: 'text' }],
            initialValues: { name: 'Demo' },
        });
        await t.render();
        await t.component.save();
        expect(t.ref.close).not.toHaveBeenCalled();
        t.component.cancel();
        expect(t.ref.close).toHaveBeenCalledWith(null);
    });
    it('serializes filters without dropping zero or false, preserving arrays and escaping text', () => {
        const params = applyFilters({
            amount: 0,
            active: false,
            missing: null,
            absent: undefined,
            currency: ['ars', 'usd', null],
            q: 'Ana & Demo',
        });
        expect(params.get('amount')).toBe('0');
        expect(params.get('active')).toBe('false');
        expect(params.getAll('currency')).toEqual(['ars', 'usd']);
        expect(params.has('missing')).toBe(false);
        expect(params.has('absent')).toBe(false);
        expect(params.get('q')).toBe('Ana & Demo');
    });
    it.each([
        [10 / 3, 3.33],
        [0, 0],
        [-10 / 3, -3.33],
        [123.456, 123.46],
    ])('rounds financial amounts %s to %s', (input, expected) => {
        expect(rounding(input)).toBe(expected);
    });
    it('formats monetary table cells using Argentine separators', () => {
        expect(new GridPipe().transform('1234.5', 'currency')).toContain(
            '1.234,50',
        );
        expect(new GridPipe().transform('Ana')).toBe('Ana');
    });
    it('refreshes a legacy view for async values and tears down on destruction', () => {
        const f = TestBed.createComponent(PermissionHost);
        const lifetime = f.componentRef.injector.get(DestroyRef);
        const view = f.componentRef.injector.get(ChangeDetectorRef);
        const mark = vi.spyOn(view, 'markForCheck');
        const stream = new Subject<number>();
        const receive = vi.fn();
        stream.pipe(refreshView(view, lifetime)).subscribe(receive);
        stream.next(1);
        expect(mark).toHaveBeenCalled();
        expect(receive).toHaveBeenCalledWith(1);
        f.destroy();
        stream.next(2);
        expect(receive).toHaveBeenCalledTimes(1);
        const late = stream
            .pipe(refreshView(view, lifetime))
            .subscribe(receive);
        expect(late.closed).toBe(true);
    });
});
