import { Component, Input } from '@angular/core';

/** One icon vocabulary for feature views, with colors inherited from design tokens. */
@Component({
    selector: 'icon',
    template: `<i
        [class]="iconClass"
        [style.font-size.px]="size"
        [style.color]="iconColor"
        aria-hidden="true"
    ></i>`,
    styles: [
        `
            :host {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
        `,
    ],
})
export class IconComponent {
    @Input() name!: IconName;
    @Input() size: number | string = 20;
    @Input() color: IconColors = 'contrast-1';
    @Input() hex = '';
    get iconClass() {
        return `pi pi-${ICONS[this.name]}${this.name === 'loader' ? ' pi-spin' : ''}`;
    }
    get iconColor() {
        return this.hex || `var(--${this.color})`;
    }
}

export const ICONS = {
    'add-circle': 'plus-circle',
    'less-circle': 'minus-circle',
    settings: 'cog',
    link: 'link',
    'globe-1': 'globe',
    'user-circle': 'user',
    'dollar-circle': 'dollar',
    users: 'users',
    close: 'times',
    apple: 'apple',
    'chevron-up': 'chevron-up',
    'chevron-down': 'chevron-down',
    'chevron-left': 'chevron-left',
    'chevron-right': 'chevron-right',
    'arrow-up': 'arrow-up',
    'arrow-down': 'arrow-down',
    'arrow-left': 'arrow-left',
    'arrow-right': 'arrow-right',
    check: 'check',
    'user-plus': 'user-plus',
    calendar: 'calendar',
    search: 'search',
    'more-vertical': 'ellipsis-v',
    whatsapp: 'whatsapp',
    instagram: 'instagram',
    trash: 'trash',
    'user-focus': 'id-card',
    'drag-drop': 'arrows-alt',
    'question-mark': 'question-circle',
    warning: 'exclamation-triangle',
    cellphone: 'mobile',
    loader: 'spinner',
    'shopping-cart': 'shopping-cart',
} as const;
export type IconName = keyof typeof ICONS;
export type IconColors =
    | 'white'
    | 'black'
    | 'primary-hover'
    | 'primary'
    | 'accent'
    | 'text-primary-1'
    | 'text-2'
    | 'contrast-1'
    | 'background-1'
    | 'background-2'
    | 'background-3'
    | 'background-4'
    | 'green-1'
    | 'tertiary'
    | 'tertiary-hover'
    | 'warn'
    | 'text-gray-500';
