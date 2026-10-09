export type OptionalType<T> = {
    [P in keyof T]?: T[P];
};
