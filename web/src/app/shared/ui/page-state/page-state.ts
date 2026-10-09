import { Component, computed, input, output } from '@angular/core';

@Component({
    selector: 'app-page-state',
    template: ` <div
        class="page-state"
        [attr.role]="kind() === 'error' ? 'alert' : 'status'"
    >
        <i
            [class]="
                kind() === 'loading'
                    ? 'pi pi-spin pi-spinner'
                    : kind() === 'error'
                      ? 'pi pi-exclamation-circle'
                      : 'pi pi-inbox'
            "
            aria-hidden="true"
        ></i>
        <h3>{{ title() }}</h3>
        <p>{{ description() || defaultDescription() }}</p>
        @if (kind() === 'error') {
            <button type="button" (click)="retry.emit()">
                Volver a intentar
            </button>
        }
    </div>`,
    styles: [
        `
            .page-state {
                padding: 70px 24px;
                text-align: center;
                background: #fff;
                border: 1px dashed var(--border);
                border-radius: 14px;
                margin: 24px 0;
            }
            i {
                font-size: 27px;
                color: #92a28c;
            }
            h3 {
                margin: 18px 0 8px;
                font-size: 17px;
            }
            p {
                color: var(--muted);
                font-size: 12px;
            }
            button {
                padding: 11px 18px;
                margin-top: 18px;
                border: 1px solid var(--border);
                border-radius: 8px;
                color: #355c42;
                font-size: 12px;
            }
        `,
    ],
})
export class PageStateComponent {
    readonly kind = input<'loading' | 'empty' | 'error'>('empty');
    readonly title = input('Todavía no hay registros');
    readonly description = input('');
    readonly defaultDescription = computed(() => this.kind() === 'loading' ? 'Esperá un momento mientras cargamos los datos.' : this.kind() === 'error' ? 'Revisá la conexión y volvé a intentar.' : 'Los nuevos registros aparecerán acá.');
    readonly retry = output<void>();
}
