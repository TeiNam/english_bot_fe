import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ConversationHistory, ConversationListResponse } from '../types/chat';
import { getConversations, getChatHistory, createConversation as createConversationApi, deleteConversation as deleteConversationApi, streamChat } from '../api/chat';

export const Chat = () => {
    const { conversationId } = useParams();
    const [message, setMessage] = useState('');
    const [streamingMessage, setStreamingMessage] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentUserMessage, setCurrentUserMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);

    // 대화 목록 조회
    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: getConversations,
        staleTime: 0
    });

    // 현재 대화 히스토리 조회
    const { data: chatHistory, refetch: refetchHistory } = useQuery({
        queryKey: ['chatHistory', conversationId],
        queryFn: () => conversationId ? getChatHistory(conversationId) : Promise.resolve([]),
        enabled: !!conversationId,
        refetchOnWindowFocus: false
    });

    // 새 대화 생성
    const createConversation = useMutation({
        mutationFn: (initialMessage: string) => createConversationApi({ initial_message: initialMessage }),
        onSuccess: async (data) => {
            // 새 메시지 객체 생성
            const newMessage = {
                chat_history_id: Date.now(),
                user_message: message,
                bot_response: '',
                create_at: new Date().toISOString()
            };

            // 첫 메시지를 제목으로 사용하기 위해 conversations 캐시 업데이트
            queryClient.setQueryData(['conversations'], (old: ConversationListResponse[] | undefined) => {
                if (!old) return [{
                    conversation_id: data.conversation_id,
                    title: message,
                    status: 'active',
                    message_count: 1,
                    create_at: new Date().toISOString(),
                    last_message_at: new Date().toISOString(),
                    last_message: message,
                    last_response: null
                }];

                return [{
                    conversation_id: data.conversation_id,
                    title: message,
                    status: 'active',
                    message_count: 1,
                    create_at: new Date().toISOString(),
                    last_message_at: new Date().toISOString(),
                    last_message: message,
                    last_response: null
                }, ...old];
            });

            // 새 대화의 히스토리 설정
            queryClient.setQueryData(['chatHistory', data.conversation_id], [newMessage]);

            // 대화 목록 갱신
            await queryClient.invalidateQueries({ queryKey: ['conversations'] });

            navigate(`/chat/${data.conversation_id}`);
        }
    });

    // 대화 삭제
    const deleteConversation = useMutation({
        mutationFn: deleteConversationApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            navigate('/chat');
        }
    });

    // 스크롤 자동 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, streamingMessage]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        // 현재 메시지 저장
        const currentMessage = message;
        setCurrentUserMessage(currentMessage);
        setMessage('');
        setIsStreaming(true);
        setStreamingMessage('');

        // 현재 대화 내역에 새 메시지 추가
        const newMessage = {
            chat_history_id: Date.now(), // 임시 ID
            user_message: currentMessage,
            bot_response: '',
            create_at: new Date().toISOString()
        };

        // 로컬 상태 업데이트
        queryClient.setQueryData(['chatHistory', conversationId], (old: ConversationHistory[] | undefined) => {
            return [...(old || []), newMessage];
        });

        try {
            const response = await streamChat({
                content: currentMessage,
                conversation_id: conversationId
            });

            if (!response.ok) throw new Error('Stream request failed');

            const reader = response.body?.getReader();
            if (!reader) throw new Error('Reader not available');

            let collectedResponse = '';
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    // 스트리밍 완료 시 최종 응답으로 대화 내역 업데이트
                    queryClient.setQueryData(['chatHistory', conversationId], (old: ConversationHistory[] | undefined) => {
                        if (!old) return [newMessage];
                        return old.map(msg =>
                            msg.chat_history_id === newMessage.chat_history_id
                                ? { ...msg, bot_response: collectedResponse }
                                : msg
                        );
                    });
                    break;
                }

                const text = new TextDecoder().decode(value);
                collectedResponse += text;

                // 스트리밍 중인 응답 업데이트
                queryClient.setQueryData(['chatHistory', conversationId], (old: ConversationHistory[] | undefined) => {
                    if (!old) return [newMessage];
                    return old.map(msg =>
                        msg.chat_history_id === newMessage.chat_history_id
                            ? { ...msg, bot_response: collectedResponse }
                            : msg
                    );
                });
            }

            // 대화 목록 갱신
            await queryClient.invalidateQueries({
                queryKey: ['conversations'],
                exact: true
            });
        } catch (error) {
            console.error('Streaming error:', error);
        } finally {
            setIsStreaming(false);
            setCurrentUserMessage('');
            // 최종 대화 내역 갱신
            await queryClient.invalidateQueries({
                queryKey: ['chatHistory', conversationId],
                exact: true
            });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleNewChat = () => {
        // 상태 초기화
        setMessage('');
        setIsStreaming(false);
        setStreamingMessage('');
        setCurrentUserMessage('');

        // 새 채팅 페이지로 이동
        navigate('/chat');
    };

    const handleDeleteChat = async () => {
        if (!conversationId) return;
        if (window.confirm('정말로 이 대화를 삭제하시겠습니까?')) {
            // 해당 대화의 히스토리만 제거
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
                {!message && !chatHistory?.length && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="text-lg mb-2">새로운 대화를 시작하세요</p>
                        <p className="text-sm">메시지를 입력하고 전송 버튼을 누르면 대화가 시작됩니다</p>
                    </div>
                )}
                {/* 헤더 */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/chat')}
                            className="md:hidden mr-2"
                        >
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
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-gray-50">
                    {(chatHistory || []).map((msg: ConversationHistory) => (
                        <div key={msg.chat_history_id} className="space-y-4">
                            <div className="flex justify-end">
                                <div className="bg-indigo-100 rounded-lg px-3 py-2 max-w-[85%]">
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {msg.user_message}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-white rounded-lg px-3 py-2 max-w-[85%] shadow-sm">
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {msg.bot_response}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* 입력 영역 */}
                <div className="p-2 border-t border-gray-200 bg-white">
                    <div className="flex space-x-4">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 min-h-[2.5rem] max-h-24 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                            disabled={isStreaming}
                        />
                        <button
                            onClick={conversationId ? handleSendMessage : () => createConversation.mutate(message)}
                            disabled={!message.trim() || isStreaming}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-10"
                        >
                            {isStreaming ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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