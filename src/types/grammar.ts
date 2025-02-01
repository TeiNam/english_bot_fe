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
    skip: number;
    limit: number;
}