import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { ConversationHistory, ConversationListResponse } from '../types/chat';
import {
    getConversations,
    getChatHistory,
    deleteConversation as deleteConversationApi,
    streamChat
} from '../api/chat';

export const Chat = () => {
    const { conversationId } = useParams();
    const [message, setMessage] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // 대화 목록 조회
    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: getConversations,
        staleTime: 1000 * 60,
        retry: 1
    });

    // 현재 대화 히스토리 조회
    const { data: chatHistory } = useQuery({
        queryKey: ['chatHistory', conversationId],
        queryFn: () =>
            conversationId ? getChatHistory(conversationId) : Promise.resolve([]),
        enabled: !!conversationId,
        refetchOnWindowFocus: false
    });

    // 대화 삭제
    const deleteConversation = useMutation({
        mutationFn: deleteConversationApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            navigate('/chat');
        }
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = useCallback(async () => {
        if (!message.trim()) return;

        const currentMessage = message;
        setMessage('');
        setIsStreaming(true);
        setError(null);

        // 임시 메시지 객체 생성 (채팅 내역 업데이트용)
        const newMessage = {
            chat_history_id: Date.now(),
            user_message: currentMessage,
            bot_response: '',
            create_at: new Date().toISOString()
        };

        try {
            // 스트리밍 요청: 새 대화인 경우 conversation_id는 undefined
            const response = await streamChat({
                content: currentMessage,
                conversation_id: conversationId || undefined
            });

            if (!response.ok) throw new Error('Stream request failed');

            // 새 대화인 경우 대화 ID 추출
            let targetConversationId = conversationId;
            if (!conversationId) {
                // 1. 응답 객체의 커스텀 프로퍼티 (있다면)
                const convIdFromProp = (response as any).conversationId;
                // 2. 응답 헤더에서 추출 (헤더명은 대소문자 상관없이 접근 가능)
                const convIdFromHeader = response.headers.get('X-Conversation-ID');
                targetConversationId = convIdFromProp || (convIdFromHeader?.trim() || '');

                // 3. 위 두 방법으로도 못 얻으면, JSON 파싱 시도 (스트리밍이 아니면 가능)
                if (!targetConversationId) {
                    try {
                        const clonedResponse = response.clone();
                        const jsonData = await clonedResponse.json();
                        targetConversationId = jsonData.conversation_id;
                    } catch (e) {
                        // JSON 파싱 실패 시 별도 처리 없음
                    }
                }

                // 4. 백업: 위 방법으로도 대화 ID를 얻지 못한 경우, 최신 대화 조회 시도
                if (!targetConversationId) {
                    try {
                        const conversationsData = await getConversations();
                        if (conversationsData && conversationsData.length > 0) {
                            // 생성된 새 대화가 최신 대화라고 가정하고 정렬
                            const sortedConversations = conversationsData.sort(
                                (a: ConversationListResponse, b: ConversationListResponse) =>
                                    new Date(b.create_at).getTime() -
                                    new Date(a.create_at).getTime()
                            );
                            targetConversationId = sortedConversations[0].conversation_id;
                        }
                    } catch (e) {
                        console.error('Fallback getConversations error:', e);
                    }
                }

                if (!targetConversationId) {
                    throw new Error('Failed to get conversation ID for new chat');
                }
                // 새 대화라면 URL 이동 (대화 ID 포함)
                navigate(`/chat/${targetConversationId}`);
            }

            // 스트리밍 응답 처리
            const reader = response.body?.getReader();
            if (!reader) throw new Error('Reader not available');

            let collectedResponse = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = new TextDecoder('utf-8').decode(value);
                collectedResponse += chunk;
                // 실시간 응답 업데이트 (간단히 상태 업데이트)
                setMessages(prev => [...prev, chunk]);
            }

            // 대화 목록 및 히스토리 갱신
            await queryClient.invalidateQueries({ queryKey: ['conversations'] });
            await queryClient.invalidateQueries({
                queryKey: ['chatHistory', targetConversationId || conversationId]
            });
        } catch (err: any) {
            console.error('Streaming error:', err);
            setError(err.message);
        } finally {
            setIsStreaming(false);
        }
    }, [message, conversationId, queryClient, navigate]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleNewChat = () => {
        setMessage('');
        setIsStreaming(false);
        navigate('/chat');
    };

    const handleDeleteChat = async () => {
        if (!conversationId) return;
        if (window.confirm('정말로 이 대화를 삭제하시겠습니까?')) {
            queryClient.removeQueries({ queryKey: ['chatHistory', conversationId] });
            await deleteConversation.mutateAsync(conversationId);
            navigate('/chat');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-4rem)] bg-white">
            {/* 사이드바 */}
            <div className="hidden md:flex flex-col bg-white p-4 border-r border-gray-200 overflow-y-auto h-full">
                <button
                    onClick={handleNewChat}
                    className="flex items-center justify-center px-4 py-2 mb-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    새 대화
                </button>
                <div className="space-y-2">
                    {conversations?.map((conv: ConversationListResponse) => (
                        <div
                            key={conv.conversation_id}
                            className={`p-3 rounded-lg flex justify-between items-start group ${
                                conv.conversation_id === conversationId
                                    ? 'bg-indigo-50 border border-indigo-200'
                                    : 'hover:bg-gray-50 border border-transparent'
                            }`}
                        >
                            <div
                                className="flex-1 cursor-pointer"
                                onClick={() => navigate(`/chat/${conv.conversation_id}`)}
                            >
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {conv.title || conv.last_message || '새 대화'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatDate(conv.create_at)}
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('이 대화를 삭제하시겠습니까?')) {
                                        deleteConversation.mutate(conv.conversation_id);
                                    }
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="대화 삭제"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 메인 채팅 영역 */}
            <div className="col-span-1 md:col-span-3 flex flex-col bg-white h-full">
                {!message && !chatHistory?.length && !conversationId && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="text-lg mb-2">새로운 대화를 시작하세요</p>
                        <p className="text-sm">
                            메시지를 입력하고 전송 버튼을 누르면 대화가 시작됩니다
                        </p>
                    </div>
                )}

                {/* 헤더 */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/chat')} className="md:hidden mr-2">
                            <ArrowLeft className="h-4 w-4 text-gray-500" />
                        </button>
                        <h1 className="text-base font-semibold text-gray-900">
                            {conversationId ? '대화 계속하기' : '새 대화'}
                        </h1>
                    </div>
                    {conversationId && (
                        <button
                            onClick={handleDeleteChat}
                            className="text-gray-400 hover:text-red-500"
                        >
                            <Trash2 className="h-5 w-5" title="대화 삭제" />
                        </button>
                    )}
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-gray-50">
                    {(chatHistory || []).map((msg: ConversationHistory) => (
                        <div key={msg.chat_history_id} className="space-y-3">
                            <div className="flex flex-col space-y-3">
                                <div className="flex justify-end">
                                    <div className="bg-indigo-100 rounded-lg px-3 py-2 max-w-[85%]">
                                        <p className="text-gray-900 whitespace-pre-wrap">
                                            {msg.user_message}
                                        </p>
                                    </div>
                                </div>
                                {msg.bot_response && (
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-lg px-3 py-2 max-w-[85%] shadow-sm">
                                            <p className="text-gray-900 whitespace-pre-wrap">
                                                {msg.bot_response}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* 입력 영역 */}
                <div className="p-2 border-t border-gray-200 bg-white">
                    {error && <div className="text-red-500 mb-2">{error}</div>}
                    <div className="flex space-x-4">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1 min-h-[2.5rem] max-h-24 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                disabled={isStreaming}
            />
                        <button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || isStreaming}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-10"
                        >
                            {isStreaming ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;