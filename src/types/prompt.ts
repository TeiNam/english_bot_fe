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