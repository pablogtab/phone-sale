import { ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, MonoTypeOperatorFunction, pipe, tap } from 'rxjs';

/** Notify OnPush views when legacy observable callbacks update ordinary fields.
 * Keep teardown tied to the view; signal/async-pipe screens don't need this adapter.
 */
export function refreshView<T>(
    view: ChangeDetectorRef,
    lifetime: DestroyRef,
): MonoTypeOperatorFunction<T> {
    if (lifetime.destroyed) return () => EMPTY;
    return pipe(
        tap({
            next: () => view.markForCheck(),
            error: () => view.markForCheck(),
            complete: () => view.markForCheck(),
        }),
        takeUntilDestroyed(lifetime),
    );
}
