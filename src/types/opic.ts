export type SectionType = 'General-Topics' | 'Role-Play';

export interface Opic {
    opic_id: number;
    section: SectionType;
    survey: string;
    question: string;
    create_at: string;
    update_at: string;
}

export interface OpicResponse {
    items: Opic[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface OpicCount {
    total: number;
    general_topics_count: number;
    role_play_count: number;
}