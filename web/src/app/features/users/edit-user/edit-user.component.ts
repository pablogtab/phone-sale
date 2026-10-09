import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { CheckboxComponent } from '@/app/shared/ui/checkbox/checkbox.component';
import { SharedModule } from '@/app/shared/ui/shared.module';
import {
    PERMISSIONS,
    PermissionActions,
    PermissionConfig,
    Permissions,
} from '@/app/core/permissions';
import { User } from '@/app/core/models/user';
import { FileService } from '@/app/core/api/file-service.service';
import { MessagesService } from '@/app/core/api/messages.service';
import { UserService } from '@/app/core/api/user.service';
import { environment } from '@/environments';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { AfterViewInit, Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';

@Component({
    selector: 'app-edit-user',
    imports: [SharedModule, InputTextModule, CheckboxModule],
    templateUrl: './edit-user.component.html',
    styleUrl: './edit-user.component.css',
})
export class EditUserComponent implements AfterViewInit {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    baseFileUrl: string = environment.filesUrl;
    private userService = inject(UserService);
    private fileService = inject(FileService);
    private messages = inject(MessagesService);
    private dialog = inject(Dialog);
    private dialogRef = inject(DialogRef);
    originalUser: User;
    data: EditUserDialogParams = inject(DIALOG_DATA);
    showLinkedRisksOnly = true;
    permissionKeys: (keyof typeof PERMISSIONS)[] = Object.keys(
        PERMISSIONS,
    ) as (keyof typeof PERMISSIONS)[];

    permissionActions: PermissionActions[] = [
        'read',
        'write',
        'admin_read',
        'admin_write',
    ];

    permissions: PermissionConfig = {
        users: [],
        banks: [],
        providers: [],
        cash_accounts: [],
        accounting_accounts: [],
        clients: [],
    };

    form = new FormGroup({
        name: new FormControl<string>(null),
        lastname: new FormControl<string>(null),
        username: new FormControl<string>(null),
        password: new FormControl<string>(null),
        roleAdmin: new FormControl<boolean>(false),
        roleUser: new FormControl<boolean>(true),
        profilePicture: new FormControl<string>(null),
        permissions: new FormGroup(
            Object.keys(PERMISSIONS).reduce(
                (acc: { [key: string]: FormArray }, key: string) => {
                    acc[key] = new FormArray([]);
                    return acc;
                },
                {},
            ),
        ),
    });

    ngOnInit() {
        this.form
            .get('roleUser')
            .valueChanges.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe({
                next: (data) => {
                    if (data) {
                        this.form.get('roleAdmin').setValue(false);
                    }
                },
            });
        this.form
            .get('roleAdmin')
            .valueChanges.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe({
                next: (data) => {
                    if (data) {
                        this.form.get('roleUser').setValue(false);
                    }
                },
            });
    }

    ngAfterViewInit(): void {
        if (this.data.userId) {
            this.fetchUser();
        }
    }

    fetchUser() {
        this.userService
            .get(this.data.userId)
            .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
            .subscribe((user) => {
                this.form.controls.name.setValue(user.name);
                this.form.controls.lastname.setValue(user.lastname);
                if (user.role === 'admin') {
                    this.form.controls.roleAdmin.setValue(true);
                    this.form.controls.roleUser.setValue(false);
                } else {
                    this.form.controls.roleAdmin.setValue(false);
                    this.form.controls.roleUser.setValue(true);
                    this.permissions = {
                        ...this.permissions,
                        ...user.permissions,
                    };
                }

                this.originalUser = user;
            });
    }

    save() {
        let user: Partial<User> = {
            id: this.data?.userId,
            permissions: this.permissions,
            name: this.form.controls.name.value,
            lastname: this.form.controls.lastname.value,
            role: this.form.controls.roleAdmin.value ? 'admin' : 'user',
        };
        if (user.id) {
            this.userService
                .update(user)
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe({
                    next: (res) => {
                        this.messages.success(
                            'Usuario actualizado correctamente',
                        );
                        this.dialogRef.close(res);
                    },
                    error: (err) => {
                        this.messages.error(err.error.validationErrors);
                    },
                });
        } else {
            ((user.password = this.form.controls.password.value),
                (user.username = this.form.controls.username.value),
                this.userService
                    .create(user)
                    .pipe(
                        refreshView(this.viewChangeDetector, this.viewLifetime),
                    )
                    .subscribe({
                        next: (res) => {
                            this.messages.success(
                                'Usuario actualizado correctamente',
                            );
                            this.dialogRef.close(res);
                        },
                        error: (err) => {
                            this.messages.error(err.error.validationErrors);
                        },
                    }));
        }
    }

    get isEdit() {
        return Boolean(this.data.userId);
    }

    changeProfilePicture() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (!input.files) return;
            const rta = await this.messages.question(
                '¿Está seguro de continuar',
            );
            if (!rta) return;
            this.userService
                .changeProfilePicture(input.files[0])
                .pipe(refreshView(this.viewChangeDetector, this.viewLifetime))
                .subscribe();
        };
        input.click();
    }

    addActionRole(permission: keyof Permissions, action: string, event: any) {
        const permissionArray: string[] = this.permissions[permission];
        const isChecked = !permissionArray?.includes(action);

        if (isChecked) {
            permissionArray.push(action);
        } else {
            const index = permissionArray.indexOf(action);
            if (index > -1) {
                permissionArray.splice(index, 1);
            }
        }
    }

    isActionChecked(
        permission: keyof PermissionConfig,
        action: PermissionActions,
    ): boolean {
        return this.permissions[permission]?.includes(action);
    }
}

export interface EditUserDialogParams {
    title: string;
    userId?: number;
}
