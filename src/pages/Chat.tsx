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
import "../index.css"; // CSS 파일의 경로를 실제 위치에 맞게 수정하세요

export const Chat = () => {
    const { conversationId } = useParams();
    const [message, setMessage] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [typedMessage, setTypedMessage] = useState<string>(''); // 타이핑 효과로 보여줄 텍스트
    const [localMessages, setLocalMessages] = useState<ConversationHistory[]>([]);
    const [tokenCount, setTokenCount] = useState(0);
    const [cost, setCost] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // 비용 계산: GPT-3.5 기준 $0.002 per 1000 tokens
    const COST_PER_TOKEN = 0.002 / 1000;
    const approximateTokenCount = (text: string) => Math.ceil(text.length / 4);

    // 대화 목록 조회
    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: getConversations,
        staleTime: 60 * 1000,
        retry: 1,
    });

    // 현재 대화 히스토리 조회
    const { data: chatHistory } = useQuery({
        queryKey: ['chatHistory', conversationId],
        queryFn: () => (conversationId ? getChatHistory(conversationId) : Promise.resolve([])),
        enabled: !!conversationId,
        refetchOnWindowFocus: false,
    });

    // 대화 삭제
    const deleteConversation = useMutation({
        mutationFn: deleteConversationApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            navigate('/chat');
        },
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, typedMessage]);

    // 자연스러운 타이핑 효과 함수
    const simulateNaturalTyping = async (text: string) => {
        setTypedMessage(''); // 기존 텍스트 초기화
        const words = text.split(' ');
        for (let word of words) {
            setTypedMessage(prev => (prev ? prev + ' ' + word : word));

            // 기본 딜레이를 10 ~ 50ms 사이의 랜덤 값으로 설정
            let delay = Math.floor(Math.random() * 20) + 20;

            // 단어가 마침표, 물음표, 느낌표로 끝나면 조금 더 긴 딜레이
            if (word.endsWith('.') || word.endsWith('?') || word.endsWith('!')) {
                delay += 300;
            } else if (word.endsWith(',') || word.endsWith(';')) {
                delay += 150;
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    };

    const handleSendMessage = useCallback(async () => {
        if (!message.trim()) return;

        const currentMessage = message;
        const tempId = Date.now();
        setMessage('');
        setIsStreaming(true);
        setError(null);
        setTypedMessage(''); // 타이핑 상태 초기화

        // 임시 메시지 객체 생성 (채팅 내역 업데이트용)
        const newMessage: ConversationHistory = {
            chat_history_id: tempId,
            user_message: currentMessage,
            bot_response: '',
            create_at: new Date().toISOString(),
        };

        // 즉시 사용자 메시지 표시
        setLocalMessages(prev => [...prev, newMessage]);

        try {
            // 스트리밍 요청
            const response = await streamChat({
                content: currentMessage,
                conversation_id: conversationId || undefined,
            });
            if (!response.ok) throw new Error('Stream request failed');

            // 새 대화인 경우 대화 ID 추출 (생략된 로직 필요 시 추가)
            let targetConversationId = conversationId;
            if (!conversationId) {
                const convIdFromProp = (response as any).conversationId;
                const convIdFromHeader = response.headers.get('X-Conversation-ID');
                targetConversationId = convIdFromProp || (convIdFromHeader?.trim() || '');
                if (!targetConversationId) {
                    try {
                        const clonedResponse = response.clone();
                        const jsonData = await clonedResponse.json();
                        targetConversationId = jsonData.conversation_id;
                    } catch (e) {
                        // JSON 파싱 실패 시 무시
                    }
                }
                if (!targetConversationId) {
                    try {
                        const conversationsData = await getConversations();
                        if (conversationsData && conversationsData.length > 0) {
                            const sortedConversations = conversationsData.sort(
                                (a: ConversationListResponse, b: ConversationListResponse) =>
                                    new Date(b.create_at).getTime() - new Date(a.create_at).getTime()
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
                navigate(`/chat/${targetConversationId}`);
            }

            // 스트리밍 응답 처리: 전체 응답을 빠르게 받아옴
            const reader = response.body?.getReader();
            if (!reader) throw new Error('Reader not available');
            const decoder = new TextDecoder('utf-8');
            let fullResponse = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
            }
            decoder.decode();

            // 전체 응답을 자연스러운 타이핑 효과로 출력 (simulateNaturalTyping 함수 호출)
            await simulateNaturalTyping(fullResponse);

            // 토큰 사용량 및 비용 계산
            const inputTokens = approximateTokenCount(currentMessage);
            const outputTokens = approximateTokenCount(fullResponse);
            const totalTokens = inputTokens + outputTokens;
            setTokenCount(totalTokens);
            setCost(totalTokens * COST_PER_TOKEN);

            await queryClient.invalidateQueries({ queryKey: ['conversations'] });
            await queryClient.invalidateQueries({
                queryKey: ['chatHistory', targetConversationId || conversationId],
            });
        } catch (err: any) {
            console.error('Streaming error:', err);
            setError(err.message);
        } finally {
            setIsStreaming(false);
        }
    }, [message, conversationId, queryClient, navigate]);

    useEffect(() => {
        if (chatHistory) {
            setLocalMessages([]);
            setTypedMessage('');
        }
    }, [chatHistory]);

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
            minute: '2-digit',
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-4rem)] bg-white">
            {/* Sidebar */}
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
                                    ? 'bg-indigo-50 border border-indigo-200 w-full'
                                    : 'hover:bg-gray-50 border border-transparent w-full'
                            }`}
                        >
                            <div
                                className="flex-1 cursor-pointer min-w-0"
                                onClick={() => navigate(`/chat/${conv.conversation_id}`)}
                            >
                                <div className="text-sm font-medium text-gray-900 truncate max-w-full">
                                    {conv.title || conv.last_message || '새 대화'}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-full">
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

            {/* Main chat area */}
            <div className="col-span-1 md:col-span-3 flex flex-col bg-white h-full">
                {/* Header */}
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
                        <button onClick={handleDeleteChat} className="text-gray-400 hover:text-red-500">
                            <Trash2 className="h-5 w-5" title="대화 삭제" />
                        </button>
                    )}
                </div>

                {/* Message list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-gray-50">
                    {/* Existing chat history */}
                    {chatHistory?.map((msg: ConversationHistory) => (
                        <div key={msg.chat_history_id} className="space-y-3">
                            <div className="flex flex-col space-y-3">
                                <div className="flex justify-end">
                                    <div className="bg-indigo-100 rounded-2xl px-4 py-2 max-w-[85%]">
                                        <p className="text-gray-900 whitespace-pre-wrap">
                                            {msg.user_message}
                                        </p>
                                    </div>
                                </div>
                                {msg.bot_response && (
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-2xl px-4 py-2 max-w-[85%] shadow-sm">
                                            <p className="text-gray-900 whitespace-pre-wrap">
                                                {msg.bot_response}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Local messages with typing effect */}
                    {localMessages.map((msg: ConversationHistory) => (
                        <div key={msg.chat_history_id} className="space-y-3">
                            <div className="flex flex-col space-y-3">
                                <div className="flex justify-end">
                                    <div className="bg-indigo-100 rounded-2xl px-4 py-2 max-w-[85%]">
                                        <p className="text-gray-900 whitespace-pre-wrap">
                                            {msg.user_message}
                                        </p>
                                    </div>
                                </div>
                                {typedMessage && (
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-2xl px-4 py-2 max-w-[85%] shadow-sm">
                                            <p className="text-gray-900 whitespace-pre-wrap fade-in">
                                                {typedMessage}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Streaming indicator */}
                    {isStreaming && !typedMessage && (
                        <div className="flex justify-start">
                            <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Token and cost info */}
                {tokenCount > 0 && (
                    <div className="text-xs text-gray-500 mt-2 px-3">
                        토큰 사용량: {tokenCount} tokens, 비용: ${cost.toFixed(6)}
                    </div>
                )}

                {/* Input area */}
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