export interface ConversationHistory {
    chat_history_id: number;
    user_message: string;
    bot_response: string;
    create_at: string;
}

export interface ConversationListResponse {
    conversation_id: string;
    title: string | null;
    status: string;
    message_count: number;
    create_at: string;
    last_message_at: string;
    last_message: string | null;
    last_response: string | null;
}

export interface ChatMessage {
    content: string;
    conversation_id?: string | null;
}

export interface CreateConversationRequest {
    initial_message: string;
}

export interface ConversationResponse {
    conversation_id: string;
    chat_history_id: number;
}