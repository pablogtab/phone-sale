/** Human-readable labels for existing catalog entries and newly seeded records. */
export function catalogLabel(label: string): string {
    return (label ?? '')
        .replace(/\(PRODUCT\)RED/gi, 'PRODUCT RED')
        .replace(/[()]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
