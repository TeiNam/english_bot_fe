export interface ApiResponse<T> {
    data: T;
}

export interface ApiPaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface ApiError {
    message: string;
    code: string;
    status: number;
}
