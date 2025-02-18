export interface Prompt {
    prompt_template_id: number;
    name: string;
    description: string | null;
    system_prompt: string;
    user_prompt: string;
    is_active: string;
    create_at: string;
    update_at: string;
}

export interface PromptResponse {
    items: Prompt[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}