import axiosClient from './axiosClient';

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
    const response = await axiosClient.get('/bot/bot-status');
    return response.data;
};

export const startBot = async () => {
    const response = await axiosClient.post('/bot/start');
    return response.data;
};

export const stopBot = async () => {
    const response = await axiosClient.post('/bot/stop');
    return response.data;
};

export const sendMessageNow = async () => {
    const response = await axiosClient.post('/bot/send-now');
    return response.data;
};