export interface Diary {
    diary_id: number;
    date: string;
    body: string;
    feedback: string | null;
    create_at: string;
    update_at: string;
}

export interface PageResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface DiaryCreate {
    date: string;
    body: string;
}

export interface DiaryUpdate {
    body: string;
    feedback?: string;
}