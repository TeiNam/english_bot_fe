export interface VocabularyMeaning {
    meaning_id: number;
    meaning: string;
    classes: string | null;
    example: string | null;
    parenthesis: string | null;
    order_no: number;
}

export type RuleType = "규칙" | "불규칙" | "규칙없음";

export interface Vocabulary {
    vocabulary_id: number;
    word: string;
    past_tense: string | null;
    past_participle: string | null;
    rule: RuleType | null;
    cycle: number;
    create_at: string;
    update_at: string;
    meanings: VocabularyMeaning[];
}

export interface VocabularyResponse {
    items: Vocabulary[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface MeaningCounts {
    [vocabularyId: number]: number;
}