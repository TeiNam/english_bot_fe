export interface SmallTalk {
    talk_id: number;
    eng_sentence: string;
    kor_sentence: string | null;
    parenthesis: string | null;
    tag: string | null;
    cycle_number: number;
    last_sent_at: string | null;
    create_at: string;
    update_at: string;
    answers: Answer[];
}

export interface Answer {
    answer_id: number;
    talk_id: number;
    eng_sentence: string;
    kor_sentence: string | null;
    update_at: string;
}

export interface SmallTalkResponse {
    items: SmallTalk[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}