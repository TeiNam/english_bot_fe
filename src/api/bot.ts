import axios from 'axios';
import { config } from '../config';
import { useAuthStore } from '../store/authStore';

const API_URL = config.apiUrl;

export interface BotStatus {
    is_running: boolean;
    current_cycle: number;
    last_message_time: string | null;
    scheduler: {
        is_running: boolean;
        jobs: any[];
    };
}

export const getBotStatus = async (): Promise<BotStatus> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get(`${API_URL}/bot/bot-status`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const startBot = async () => {
    const token = useAuthStore.getState().token;
    const response = await axios.post(`${API_URL}/bot/start`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const stopBot = async () => {
    const token = useAuthStore.getState().token;
    const response = await axios.post(`${API_URL}/bot/stop`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const sendMessageNow = async () => {
    const token = useAuthStore.getState().token;
    const response = await axios.post(`${API_URL}/bot/send-now`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};