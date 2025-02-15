// api/chat.ts
import axios from 'axios';
import { config } from '../config';
import { useAuthStore } from '../store/authStore';
import {
    ConversationListResponse,
    ConversationHistory,
    ChatMessage
} from '../types/chat';

const API_URL = config.apiUrl;

// API 요청에 공통으로 사용할 설정
const getAuthHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const getConversations = async (): Promise<ConversationListResponse[]> => {
    try {
        const response = await axios.get(
            `${API_URL}/api/v1/chat/conversations`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch conversations:', error);
        if (error.response?.status === 404) {
            return [];
        }
        throw new Error(
            error.response?.data?.detail ||
            '대화 목록을 불러오는데 실패했습니다.'
        );
    }
};

export const getChatHistory = async (conversationId: string): Promise<ConversationHistory[]> => {
    try {
        const response = await axios.get(
            `${API_URL}/api/v1/chat/history/${conversationId}`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch chat history:', error);
        if (error.response?.status === 404) {
            return [];
        }
        throw new Error(
            error.response?.data?.detail ||
            '대화 내역을 불러오는데 실패했습니다.'
        );
    }
};

export const deleteConversation = async (conversationId: string): Promise<{ success: boolean }> => {
    try {
        const { data } = await axios.delete(
            `${API_URL}/api/v1/chat/conversations/${conversationId}`,
            getAuthHeaders()
        );
        return data;
    } catch (error: any) {
        console.error('Failed to delete conversation:', error);
        // 404는 이미 삭제된 것으로 간주
        if (error.response?.status === 404) {
            return { success: true };
        }
        throw new Error(
            error.response?.data?.detail ||
            '대화를 삭제하는데 실패했습니다.'
        );
    }
};

export const streamChat = async (data: ChatMessage): Promise<Response> => {
    const token = useAuthStore.getState().token;
    try {
        const response = await fetch(`${API_URL}/api/v1/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        // 서버 에러 응답 처리
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.detail;
            } catch {
                errorMessage = `Stream request failed: ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        // 새 대화인 경우 conversation_id 확인
        if (!data.conversation_id) {
            const conversationId = response.headers.get('X-Conversation-ID');
            if (!conversationId) {
                console.warn('No conversation ID in response headers:', response.headers);
            }
            // conversation_id를 response 객체에 추가
            (response as any).conversationId = conversationId;
        }

        return response;
    } catch (error) {
        console.error('Stream request failed:', error);
        throw error;
    }
};