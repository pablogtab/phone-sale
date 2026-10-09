export function applyFilters<T>(
    data: T,
    params = new URLSearchParams(),
): URLSearchParams {
    Object.keys(data).forEach((key) => {
        const value = data[key as keyof T];
        if (value !== undefined) {
            const values = Array.isArray(value) ? value : [value];
            values.forEach((value) => {
                if (value === undefined || value === null) return;
                params.append(key, value.toString());
            });
        }
    });

    return params;
}
