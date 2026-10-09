import {
    Directive,
    inject,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import { CurrentRoleService } from '../../core/auth/current-role.service';
import { Subject, takeUntil } from 'rxjs';
import { ROLES } from '../../core/permissions';

@Directive({
    selector: '[hasPermission]',
    standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
    @Input() hasPermission: { permission: string; actions: string[] };

    protected readonly currentRoleService = inject(CurrentRoleService);
    protected readonly viewContainer = inject(ViewContainerRef);
    protected readonly templateRef = inject(TemplateRef<unknown>);
    protected readonly destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.currentRoleService.currentRole$
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (role: any) => {
                    if (role?.role === ROLES.admin) {
                        this.addTemplate();
                        return;
                    }
                    if (
                        !role ||
                        !role.permissions ||
                        !role.permissions[this.hasPermission.permission]
                    ) {
                        this.clearTemplate();
                        return;
                    }
                    const actionsForPermission =
                        role.permissions[this.hasPermission.permission];

                    const hasRequiredActions = this.hasPermission.actions.every(
                        (action) => actionsForPermission.includes(action),
                    );

                    if (hasRequiredActions) {
                        this.addTemplate();
                    } else {
                        this.clearTemplate();
                    }
                },
            });
    }

    private addTemplate() {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
    }

    private clearTemplate() {
        this.viewContainer.clear();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
