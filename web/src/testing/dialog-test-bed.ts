import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { vi } from 'vitest';
import { MessagesService } from '@/app/core/api/messages.service';
import { CurrentRoleService } from '@/app/core/auth/current-role.service';
import { user, flushScreens } from './screen-fixtures';
export function dialogTest<T>(component: Type<T>, data: unknown = {}) {
    const ref = { close: vi.fn(), disableClose: false };
    const messages = {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        showPublicError: vi.fn(),
        question: vi.fn().mockResolvedValue(false),
    };
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            provideHttpClient(),
            provideHttpClientTesting(),
            provideNoopAnimations(),
            { provide: DIALOG_DATA, useValue: data },
            { provide: DialogRef, useValue: ref },
            { provide: MessagesService, useValue: messages },
        ],
    });
    TestBed.inject(CurrentRoleService).setCurrentRole(user);
    const fixture = TestBed.createComponent(component);
    fixture.autoDetectChanges();
    const http = TestBed.inject(HttpTestingController);
    return {
        fixture,
        http,
        ref,
        messages,
        component: fixture.componentInstance,
        async render() {
            await flushScreens(http);
            await fixture.whenStable();
            await flushScreens(http, () => true);
            await fixture.whenStable();
        },
    };
}
