import {
    ChangeDetectorRef as ViewChangeDetector,
    DestroyRef as ViewLifetime,
    inject as injectView,
} from '@angular/core';
import { refreshView } from '@/app/core/utils/refresh-view';
import { SharedModule } from '@/app/shared/ui/shared.module';
import { User } from '@/app/core/models/user';
import { UserService } from '@/app/core/api/user.service';
import { environment } from '@/environments';
import { Dialog } from '@angular/cdk/dialog';
import { Component, OnInit, inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { EditUserComponent } from './edit-user/edit-user.component';
import { ButtonModule } from '@openng/optimus-ui/button';
import { HasPermissionDirective } from '@/app/shared/directives/has-permission.directive';

@Component({
    selector: 'app-users',
    imports: [SharedModule, ButtonModule, HasPermissionDirective],
    templateUrl: './users.component.html',
    styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
    private readonly viewChangeDetector = injectView(ViewChangeDetector);
    private readonly viewLifetime = injectView(ViewLifetime);
    private dialog = inject(Dialog);
    private userService = inject(UserService);
    filesUrl = environment.filesUrl;
    users$: Observable<User[]>;
    loadingUsers: boolean = true;

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this.loadingUsers = true;
        this.users$ = this.userService.search('').pipe(
            finalize(() => {
                this.loadingUsers = false;
            }),
        );
    }

    newUser() {
        const data: EditUserDialogParams = {
            title: 'Nuevo Usuario',
        };

        this.dialog
            .open(EditUserComponent, { data })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => {
                this.loadUsers();
            });
    }

    editUser(user: User) {
        const data: EditUserDialogParams = {
            title: 'Editar Usuario',
            userId: user.id,
        };
        this.dialog
            .open(EditUserComponent, { data })
            .closed.pipe(
                refreshView(this.viewChangeDetector, this.viewLifetime),
            )
            .subscribe(() => {
                this.loadUsers();
            });
    }
}

export interface EditUserDialogParams {
    title: string;
    userId?: number;
}
