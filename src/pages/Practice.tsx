import { useQuery } from '@tanstack/react-query';
import { getSentence, SentenceResponse } from '../api/smallTalk';
import { ArrowLeft, ArrowRight, Info, Tag as TagIcon } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Practice = () => {
    const [currentTalkId, setCurrentTalkId] = useState<number | null>(null);
    const token = useAuthStore((state) => state.token);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const { data: sentence, isLoading, error } = useQuery<SentenceResponse>({
        queryKey: ['sentence', currentTalkId],
        queryFn: () => getSentence(
            'current',
            currentTalkId || undefined
        )
    });

    const handlePrevious = async () => {
        if (sentence?.data.talk_id) {
            const prevSentence = await getSentence('prev', sentence.data.talk_id);
            setCurrentTalkId(prevSentence.data.talk_id);
        }
    };

    const handleNext = async () => {
        if (sentence?.data.talk_id) {
            const nextSentence = await getSentence('next', sentence.data.talk_id);
            setCurrentTalkId(nextSentence.data.talk_id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                문장을 불러오는데 실패했습니다
            </div>
        );
    }

    if (!sentence) {
        return (
            <div className="text-center text-gray-500 p-4">
                등록된 문장이 없습니다
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 sm:px-0">
            <div className="h-[32px] flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Practice</h1>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6">
                <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                        {sentence.data.eng_sentence}
                    </h2>

                    {sentence.data.kor_sentence && (
                        <p className="text-base sm:text-lg text-gray-600">
                            {sentence.data.kor_sentence}
                        </p>
                    )}

                    {sentence.data.parenthesis && (
                        <div className="flex items-start space-x-3 text-gray-600 bg-gray-50 p-4 sm:p-5 rounded-lg">
                            <div className="flex-shrink-0 bg-white rounded-full p-1 shadow-sm">
                                <Info className="h-5 w-5 text-gray-400" />
                            </div>
                            <pre className="whitespace-pre-wrap font-sans text-sm break-words flex-grow">
                                {sentence.data.parenthesis}
                            </pre>
                        </div>
                    )}

                    {sentence.data.tag && (
                        <div className="flex items-center space-x-2 text-gray-500">
                            <TagIcon className="h-4 w-4" />
                            <span className="text-sm">{sentence.data.tag}</span>
                        </div>
                    )}

                    <div className="flex justify-between pt-6">
                        <button
                            onClick={handlePrevious}
                            disabled={!sentence.navigation.has_prev}
                            className="flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            이전 문장
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!sentence.navigation.has_next}
                            className="flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            다음 문장
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};