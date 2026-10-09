import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { dialogTest } from '@/testing/dialog-test-bed';
import { EditUserComponent } from './edit-user.component';
import { user } from '@/testing/screen-fixtures';
describe('user management', () => {
    afterEach(() => {
        try {
            TestBed.inject(HttpTestingController).verify();
        } finally {
            TestBed.resetTestingModule();
        }
    });
    it('keeps administrator and regular user selections mutually exclusive', async () => {
        const t = dialogTest(EditUserComponent, { title: 'Nuevo usuario' });
        await t.render();
        t.component.form.controls.roleAdmin.setValue(true);
        expect(t.component.form.controls.roleUser.value).toBe(false);
        t.component.form.controls.roleUser.setValue(true);
        expect(t.component.form.controls.roleAdmin.value).toBe(false);
    });
    it('creates a regular user with selected permissions', async () => {
        const t = dialogTest(EditUserComponent, { title: 'Nuevo usuario' });
        await t.render();
        t.component.form.patchValue({
            name: 'Demo',
            lastname: 'Usuario',
            username: 'demo.user',
            password: 'DemoPassword2026!',
        });
        t.component.permissions.clients = ['read'];
        t.component.save();
        const request = t.http.expectOne('/api/users/');
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(
            expect.objectContaining({
                name: 'Demo',
                lastname: 'Usuario',
                username: 'demo.user',
                password: 'DemoPassword2026!',
                role: 'user',
                permissions: expect.objectContaining({ clients: ['read'] }),
            }),
        );
        request.flush(user);
        expect(t.ref.close).toHaveBeenCalledWith(user);
    });
    it('updates existing user labels and permissions without sending a password', async () => {
        const t = dialogTest(EditUserComponent, {
            title: 'Editar usuario',
            userId: 1,
        });
        await t.render();
        t.component.form.controls.name.setValue('Nuevo');
        t.component.save();
        const request = t.http.expectOne('/api/users/1');
        expect(request.request.method).toBe('PATCH');
        expect(request.request.body.password).toBeUndefined();
        expect(request.request.body.name).toBe('Nuevo');
        request.flush(user);
        expect(t.ref.close).toHaveBeenCalledWith(user);
    });
    it('keeps a user draft after validation errors from the server', async () => {
        const t = dialogTest(EditUserComponent, {
            title: 'Editar usuario',
            userId: 1,
        });
        await t.render();
        t.component.save();
        t.http
            .expectOne('/api/users/1')
            .flush(
                { validationErrors: ['Nombre inválido'] },
                { status: 400, statusText: 'Bad Request' },
            );
        expect(t.messages.error).toHaveBeenCalledWith(['Nombre inválido']);
        expect(t.ref.close).not.toHaveBeenCalled();
        expect(t.component.form.controls.name.value).toBe('Admin');
    });
});
