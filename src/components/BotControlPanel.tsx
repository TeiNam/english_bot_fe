import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBotStatus, startBot, stopBot, sendMessageNow } from '../api/bot';
import { Play, Pause, Send, Loader2, Clock } from 'lucide-react';

export const BotControlPanel = () => {
    const queryClient = useQueryClient();

    const { data: botStatus, isLoading: isBotStatusLoading } = useQuery({
        queryKey: ['botStatus'],
        queryFn: getBotStatus,
        refetchInterval: 5000
    });

    const startMutation = useMutation({
        mutationFn: startBot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['botStatus'] });
        }
    });

    const stopMutation = useMutation({
        mutationFn: stopBot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['botStatus'] });
        }
    });

    const sendNowMutation = useMutation({
        mutationFn: sendMessageNow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['botStatus'] });
        }
    });

    const handleToggleBot = () => {
        if (botStatus?.scheduler.is_running) {
            stopMutation.mutate();
        } else {
            startMutation.mutate();
        }
    };

    const handleSendNow = () => {
        sendNowMutation.mutate();
    };

    const formatDateTime = (dateString: string | null | undefined) => {
        if (!dateString) return '메시지 없음';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '잘못된 시간';

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diff / (1000 * 60));
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

        // 1분 이내
        if (diffMinutes < 1) {
            return '방금 전';
        }
        // 1시간 이내
        if (diffHours < 1) {
            return `${diffMinutes}분 전`;
        }
        // 24시간 이내
        if (diffDays < 1) {
            return `${diffHours}시간 전`;
        }
        // 7일 이내
        if (diffDays < 7) {
            return `${diffDays}일 전`;
        }

        // 그 외의 경우 전체 날짜 표시
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isBotStatusLoading) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col space-y-4">
                {/* 상태 표시 영역 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 스케줄러 상태 */}
                    <div className="flex items-center space-x-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${botStatus?.scheduler.is_running ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-700">
              스케줄러: {botStatus?.scheduler.is_running ? '실행 중' : '중지됨'}
            </span>
                    </div>
                    {/* 봇 상태 */}
                    <div className="flex items-center space-x-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${botStatus?.is_running ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-700">
              봇: {botStatus?.is_running ? '실행 중' : '중지됨'}
            </span>
                    </div>
                </div>

                {/* 타이밍 정보 */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>마지막 메시지: {formatDateTime(botStatus?.last_message_time)}</span>
                </div>

                {/* 현재 사이클 정보 */}
                <div className="text-sm text-gray-600">
                    현재 사이클: {botStatus?.current_cycle || 0}
                </div>

                {/* 컨트롤 버튼 */}
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleToggleBot}
                        disabled={startMutation.isPending || stopMutation.isPending}
                        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                            botStatus?.scheduler.is_running
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {startMutation.isPending || stopMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : botStatus?.scheduler.is_running ? (
                            <Pause className="h-4 w-4 mr-1" />
                        ) : (
                            <Play className="h-4 w-4 mr-1" />
                        )}
                        {botStatus?.scheduler.is_running ? '중지' : '시작'}
                    </button>
                    <button
                        onClick={handleSendNow}
                        disabled={!botStatus?.scheduler.is_running || !botStatus?.is_running || sendNowMutation.isPending}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sendNowMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                            <Send className="h-4 w-4 mr-1" />
                        )}
                        즉시 전송
                    </button>
                </div>
            </div>
        </div>
    );
};