import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BalanceColorDirective } from './balance-color.directive';

@Component({ imports: [BalanceColorDirective], template: '<span balanceColor [value]="balance()">{{balance()}}</span>' })
class BalanceScreen { balance = signal(0); }

describe('account balance visibility', () => {
    it('keeps a zero balance visible on white account cards and changes color when the amount changes', () => {
        const fixture = TestBed.createComponent(BalanceScreen); fixture.detectChanges();
        const balance: HTMLElement = fixture.nativeElement.querySelector('span');
        expect(balance.textContent).toBe('0');
        expect(balance.style.color).not.toBe('white');
        const neutral = balance.style.color;
        fixture.componentInstance.balance.set(-10); fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(); const negative = balance.style.color;
        fixture.componentInstance.balance.set(10); fixture.changeDetectorRef.markForCheck(); fixture.detectChanges();
        expect(balance.style.color).not.toBe(neutral);
        expect(balance.style.color).not.toBe(negative);
    });
});
