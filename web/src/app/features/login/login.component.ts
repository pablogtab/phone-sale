import { StoreSettingsService } from '@/app/core/api/store-settings.service';
import { Component, inject, signal } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { LOCAL_STORAGE_TOKEN_KEY } from '../../core/const';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    readonly store = inject(StoreSettingsService);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    readonly pending = signal(false);
    readonly error = signal('');
    readonly showPassword = signal(false);
    readonly form = new FormGroup({
        username: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        password: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    ngOnInit() {
        if (localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY))
            this.router.navigateByUrl('/');
    }

    login() {
        if (this.pending()) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        this.error.set('');
        this.pending.set(true);
        const { username, password } = this.form.getRawValue();
        this.auth
            .login(username.trim(), password)
            .pipe(finalize(() => this.pending.set(false)))
            .subscribe({
                next: (data) => {
                    this.auth.saveData(data);
                    this.router.navigateByUrl('/');
                },
                error: (err) =>
                    this.error.set(
                        err.status === 0
                            ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
                            : err.error?.public
                              ? err.error.message
                              : 'No pudimos iniciar sesión. Revisá tu usuario y contraseña.',
                    ),
            });
    }
}
