export interface Grammar {
    grammar_id: number;
    title: string;
    body: string | null;
    url: string | null;
    create_at: string;
    update_at: string;
}

export interface GrammarResponse {
    items: Grammar[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}