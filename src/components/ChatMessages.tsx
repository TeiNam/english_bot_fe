import React from 'react';
import { ConversationHistory } from '../types/chat';
import { useInView } from 'react-intersection-observer';

interface MessageItemProps {
    message: ConversationHistory;
    isLast?: boolean;
}

const MessageItem = React.memo(({ message, isLast }: MessageItemProps) => (
    <div className="space-y-3">
        <div className="flex flex-col space-y-3">
            <div className="flex justify-end">
                <div className="bg-indigo-100 rounded-2xl px-3 md:px-4 py-2 max-w-[90%] md:max-w-[85%]">
                    <p className="text-gray-900 whitespace-pre-wrap">
                        {message.user_message}
                    </p>
                </div>
            </div>
            {message.bot_response && (
                <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-3 md:px-4 py-2 max-w-[90%] md:max-w-[85%] shadow-sm">
                        <p className="text-gray-900 whitespace-pre-wrap">
                            {message.bot_response}
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
));

interface ChatMessagesProps {
    messages: ConversationHistory[];
    isLoading?: boolean;
    onLoadMore?: () => void;
}

export const ChatMessages = React.memo(({ messages, isLoading, onLoadMore }: ChatMessagesProps) => {
    const { ref, inView } = useInView({
        threshold: 0.5,
        triggerOnce: false
    });

    React.useEffect(() => {
        if (inView && onLoadMore && !isLoading) {
            onLoadMore();
        }
    }, [inView, onLoadMore, isLoading]);

    return (
        <div className="space-y-3">
            {messages.map((message, index) => (
                <div key={message.chat_history_id} ref={index === 0 ? ref : undefined}>
                    <MessageItem
                        message={message}
                        isLast={index === messages.length - 1}
                    />
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                </div>
            )}
        </div>
    );
});