import axios from 'axios';
import { config } from '../config';
import { useAuthStore } from '../store/authStore';
import {
    ConversationListResponse,
    ConversationHistory,
    CreateConversationRequest,
    ConversationResponse,
    ChatMessage
} from '../types/chat';

const API_URL = config.apiUrl;

export const getConversations = async (): Promise<ConversationListResponse[]> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get(`${API_URL}/api/v1/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getChatHistory = async (conversationId: string): Promise<ConversationHistory[]> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get(
        `${API_URL}/api/v1/chat/history/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const createConversation = async (data: CreateConversationRequest): Promise<ConversationResponse> => {
    const token = useAuthStore.getState().token;
    const response = await axios.post(
        `${API_URL}/api/v1/chat/conversation`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const deleteConversation = async (conversationId: string): Promise<void> => {
    const token = useAuthStore.getState().token;
    await axios.delete(
        `${API_URL}/api/v1/chat/conversation/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

export const streamChat = async (data: ChatMessage): Promise<Response> => {
    const token = useAuthStore.getState().token;
    return fetch(`${API_URL}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};