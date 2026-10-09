export type PaginationDto = {
    page?: number;
    limit?: number;
    search?: string;
};

export type Paginated<T> = {
    data: T[];
    totalRows: number;
    page: number;
    limit: number;
    totalPages: number;
};

export function paginatedURLParams(dto: PaginationDto): string {
    const params = new URLSearchParams();
    if (dto.page) {
        params.set('page', dto.page.toString());
    }
    if (dto.limit) {
        params.set('limit', dto.limit.toString());
    }
    if (dto.search) {
        params.set('search', dto.search);
    }

    let stringParams = params.toString();
    return `${stringParams ? '?' : ''}${stringParams}`;
}
