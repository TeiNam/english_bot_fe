import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SmallTalkList } from '../components/SmallTalkList';
import { ManageSmallTalkForm } from '../components/ManageSmallTalkForm';
import { ManageAnswerForm } from '../components/ManageAnswerForm';
import { BotControlPanel } from '../components/BotControlPanel';
import { getSmallTalk, deleteSmallTalk } from '../api/smallTalk';
import { getAnswers, deleteAnswer } from '../api/answer';
import { Plus, Edit2, Trash2, MessageCircle } from 'lucide-react';
import { SmallTalk, Answer } from '../types/smallTalk';

export const Manage = () => {
    const queryClient = useQueryClient();
    const [selectedTalkId, setSelectedTalkId] = useState<number | null>(null);
    const [isSmallTalkFormOpen, setIsSmallTalkFormOpen] = useState(false);
    const [isAnswerFormOpen, setIsAnswerFormOpen] = useState(false);
    const [editingSmallTalk, setEditingSmallTalk] = useState<SmallTalk | null>(null);
    const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);

    const { data: selectedTalk } = useQuery({
        queryKey: ['smallTalk', selectedTalkId],
        queryFn: () => selectedTalkId ? getSmallTalk(selectedTalkId) : null,
        enabled: !!selectedTalkId
    });

    const { data: answers } = useQuery({
        queryKey: ['answers', selectedTalkId],
        queryFn: () => selectedTalkId ? getAnswers(selectedTalkId) : [],
        enabled: !!selectedTalkId
    });

    const deleteTalkMutation = useMutation({
        mutationFn: deleteSmallTalk,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['smallTalks'] });
            setSelectedTalkId(null);
        }
    });

    const deleteAnswerMutation = useMutation({
        mutationFn: deleteAnswer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['answers', selectedTalkId] });
            queryClient.invalidateQueries({ queryKey: ['answerCounts'] });
        }
    });

    const handleEditSmallTalk = (talk: SmallTalk) => {
        setEditingSmallTalk(talk);
        setIsSmallTalkFormOpen(true);
    };

    const handleEditAnswer = (answer: Answer) => {
        setEditingAnswer(answer);
        setIsAnswerFormOpen(true);
    };

    const handleDeleteSmallTalk = async (talkId: number) => {
        if (window.confirm('정말로 이 문장을 삭제하시겠습니까?')) {
            await deleteTalkMutation.mutateAsync(talkId);
        }
    };

    const handleDeleteAnswer = async (answerId: number) => {
        if (window.confirm('정말로 이 답변을 삭제하시겠습니까?')) {
            await deleteAnswerMutation.mutateAsync(answerId);
        }
    };

    return (
        <div className="space-y-6">
            <BotControlPanel />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <div className="h-[32px] flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">English Sentences Setup</h1>
                        <button
                            onClick={() => {
                                setEditingSmallTalk(null);
                                setIsSmallTalkFormOpen(true);
                            }}
                            className="flex items-center px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            새 문장
                        </button>
                    </div>
                    <div className="h-[20px]" /> {/* 제목과 리스트 사이의 간격 */}
                    <SmallTalkList
                        onSelectTalk={setSelectedTalkId}
                        selectedTalkId={selectedTalkId}
                    />
                </div>

                <div className="lg:sticky lg:top-6">
                    <div className="h-[52px]" />
                    {selectedTalkId && selectedTalk ? (
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {selectedTalk.eng_sentence}
                                    </h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditSmallTalk(selectedTalk)}
                                            className="p-2 text-gray-400 hover:text-gray-500"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSmallTalk(selectedTalk.talk_id)}
                                            className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                {selectedTalk.kor_sentence && (
                                    <p className="text-gray-600 mb-4">{selectedTalk.kor_sentence}</p>
                                )}
                                {selectedTalk.parenthesis && (
                                    <p className="text-sm text-gray-500">{selectedTalk.parenthesis}</p>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <MessageCircle className="h-5 w-5 mr-2" />
                                        답변 목록
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setEditingAnswer(null);
                                            setIsAnswerFormOpen(true);
                                        }}
                                        className="flex items-center px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        답변 추가
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {answers?.map((answer) => (
                                        <div
                                            key={answer.answer_id}
                                            className="border-l-4 border-indigo-200 pl-4 py-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-gray-900">{answer.eng_sentence}</p>
                                                    {answer.kor_sentence && (
                                                        <p className="text-gray-600 text-sm mt-1">
                                                            {answer.kor_sentence}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditAnswer(answer)}
                                                        className="p-1 text-gray-400 hover:text-gray-500"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAnswer(answer.answer_id)}
                                                        className="p-1 text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                            관리할 문장을 선택해주세요
                        </div>
                    )}
                </div>
            </div>

            {/* 문장 관리 모달 */}
            {isSmallTalkFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingSmallTalk ? '문장 수정' : '새 문장 등록'}
                        </h2>
                        <ManageSmallTalkForm
                            initialData={editingSmallTalk || undefined}
                            onClose={() => {
                                setIsSmallTalkFormOpen(false);
                                setEditingSmallTalk(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* 답변 관리 모달 */}
            {isAnswerFormOpen && selectedTalkId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingAnswer ? '답변 수정' : '새 답변 등록'}
                        </h2>
                        <ManageAnswerForm
                            talkId={selectedTalkId}
                            initialData={editingAnswer || undefined}
                            onClose={() => {
                                setIsAnswerFormOpen(false);
                                setEditingAnswer(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};