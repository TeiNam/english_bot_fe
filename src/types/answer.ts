// src/types/answer.ts
export interface Answer {
    answer_id: number;
    talk_id: number;
    eng_sentence: string;
    kor_sentence: string;
    update_at: string;
}

export interface AnswerCount {
    talk_id: number;
    answer_count: number;
}

