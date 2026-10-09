import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeElapsed',
})
export class TimeElapsedPipe implements PipeTransform {
    transform(value: Date): string {
        const now = new Date();

        const diff = now.getTime() - value.getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${pluralize(days, 'dia', 's')}`;
        }

        if (hours > 0) {
            return `${pluralize(hours, 'hora', 's')}`;
        }

        if (minutes > 0) {
            return `${pluralize(minutes, 'minuto', 's')}`;
        }

        return `${pluralize(seconds, 'segundo', 's')}`;
    }
}

const pluralize = (value: number, unit: string, suffix: string) => {
    if (value > 1) {
        return `${value} ${unit}${suffix}`;
    }
    return `${value} ${unit}`;
};
