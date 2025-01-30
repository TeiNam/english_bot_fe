import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSmallTalk } from '../api/smallTalk';
import { getAnswers } from '../api/answer';
import { MessageCircle, Info, Tag as TagIcon } from 'lucide-react';

interface Props {
    talkId: number;
    onClose: () => void;
}

export const SmallTalkDetail = ({ talkId, onClose }: Props) => {
    const { data: talk, isLoading: isTalkLoading } = useQuery({
        queryKey: ['smallTalk', talkId],
        queryFn: () => getSmallTalk(talkId)
    });

    const { data: answers, isLoading: isAnswersLoading } = useQuery({
        queryKey: ['answers', talkId],
        queryFn: () => getAnswers(talkId),
        enabled: !!talkId
    });

    if (isTalkLoading || isAnswersLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!talk) {
        return (
            <div className="text-center text-red-600 p-4">
                스몰톡을 불러오는데 실패했습니다
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{talk.eng_sentence}</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                >
                    <span className="sr-only">닫기</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-6">
                {talk.kor_sentence && (
                    <div className="text-lg text-gray-600">
                        {talk.kor_sentence}
                    </div>
                )}

                {talk.parenthesis && (
                    <div className="flex items-start space-x-2 text-gray-600 bg-gray-50 p-4 rounded-lg">
                        <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                        <p>{talk.parenthesis}</p>
                    </div>
                )}

                {talk.tag && (
                    <div className="flex items-center space-x-2">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{talk.tag}</span>
                    </div>
                )}

                {answers && answers.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <MessageCircle className="h-5 w-5 mr-2" />
                            답변 목록
                        </h3>
                        <div className="space-y-4">
                            {answers.map((answer) => (
                                <div
                                    key={answer.answer_id}
                                    className="border-l-4 border-indigo-200 pl-4 py-2"
                                >
                                    <p className="text-gray-900 mb-2">{answer.eng_sentence}</p>
                                    {answer.kor_sentence && (
                                        <p className="text-gray-600">{answer.kor_sentence}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};