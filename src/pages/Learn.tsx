import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {SmallTalkList} from '../components/SmallTalkList';
import {ManageSmallTalkForm} from '../components/ManageSmallTalkForm';
import {ManageAnswerForm} from '../components/ManageAnswerForm';
import {deleteSmallTalk, getSmallTalk} from '../api/smallTalk';
import {deleteAnswer, getAnswers} from '../api/answer';
import {Edit2, Info, MessageCircle, Plus, Trash2} from 'lucide-react';
import {Answer, SmallTalk} from '../types/smallTalk';

export const Learn = () => {
    const queryClient = useQueryClient();
    const [selectedTalkId, setSelectedTalkId] = useState<number | null>(null);
    const [isSmallTalkFormOpen, setIsSmallTalkFormOpen] = useState(false);
    const [isAnswerFormOpen, setIsAnswerFormOpen] = useState(false);
    const [editingSmallTalk, setEditingSmallTalk] = useState<SmallTalk | null>(null);
    const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);

    // SmallTalk Queries
    const {data: selectedTalk, isLoading: isSmallTalkLoading, error: smallTalkError} = useQuery({
        queryKey: ['smallTalk', selectedTalkId],
        queryFn: async () => {
            console.log('Fetching small talk details:', selectedTalkId);
            if (!selectedTalkId) return null;

            // 스몰톡 데이터 가져오기
            const smallTalk = await getSmallTalk(selectedTalkId);

            // 답변 데이터 가져오기
            try {
                const answers = await getAnswers(selectedTalkId);
                return {
                    ...smallTalk,
                    answers: answers || []
                };
            } catch (error) {
                return {
                    ...smallTalk,
                    answers: []
                };
            }
        },
        enabled: !!selectedTalkId
    });

    const {data: answers = [], isLoading: isAnswersLoading} = useQuery({
        queryKey: ['answers', selectedTalkId],
        queryFn: () => selectedTalkId ? getAnswers(selectedTalkId) : [],
        enabled: !!selectedTalkId,
        retry: 1,
    });

    // Mutations
    const deleteTalkMutation = useMutation({
        mutationFn: deleteSmallTalk,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['smallTalks']});
            setSelectedTalkId(null);
        }
    });

    const deleteAnswerMutation = useMutation({
        mutationFn: deleteAnswer,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['answers', selectedTalkId]});
            queryClient.invalidateQueries({queryKey: ['answerCounts']});
        }
    });

    // Handlers
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* 첫 번째 컬럼 - 리스트 */}
            <div className="w-full mb-4 md:mb-0">
                <div className="h-[32px] flex justify-between items-center mb-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">English Sentences</h1>
                    <button
                        onClick={() => {
                            setEditingSmallTalk(null);
                            setIsSmallTalkFormOpen(true);
                        }}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="h-4 w-4 mr-1"/>
                        <span className="hidden md:inline">새 문장</span>
                        <span className="md:hidden">추가</span>
                    </button>
                </div>
                <SmallTalkList
                    onSelectTalk={setSelectedTalkId}
                    selectedTalkId={selectedTalkId}
                />
            </div>

            {/* 두 번째 컬럼 - 상세 */}
            <div className="w-full md:sticky md:top-6">
                <div className="h-[20px] md:h-[52px]"/>
                {isSmallTalkLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                ) : smallTalkError ? (
                    <div className="bg-red-50 rounded-lg p-4 md:p-6 text-center text-red-600">
                        데이터를 불러오는데 실패했습니다.
                    </div>
                ) : selectedTalkId && selectedTalk ? (
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="p-4 md:p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                                    {selectedTalk.eng_sentence}
                                </h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditSmallTalk(selectedTalk)}
                                        className="p-2 text-gray-400 hover:text-gray-500"
                                    >
                                        <Edit2 className="h-5 w-5"/>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSmallTalk(selectedTalk.talk_id)}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-5 w-5"/>
                                    </button>
                                </div>
                            </div>
                            {selectedTalk.kor_sentence && (
                                <p className="text-gray-600 mb-4">{selectedTalk.kor_sentence}</p>
                            )}
                            {selectedTalk.parenthesis && (
                                <div className="flex items-start space-x-3 text-gray-600 bg-gray-50 p-4 rounded-lg">
                                    <div className="flex-shrink-0 bg-white rounded-full p-1 shadow-sm">
                                        <Info className="h-5 w-5 text-gray-400"/>
                                    </div>
                                    <pre className="whitespace-pre-wrap font-sans text-sm break-words flex-grow">
                                        {selectedTalk.parenthesis}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base md:text-lg font-medium text-gray-900 flex items-center">
                                    <MessageCircle className="h-5 w-5 mr-2"/>
                                    답변 목록
                                </h3>
                                <button
                                    onClick={() => {
                                        setEditingAnswer(null);
                                        setIsAnswerFormOpen(true);
                                    }}
                                    className="flex items-center px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Plus className="h-4 w-4 mr-1"/>
                                    <span className="hidden md:inline">답변 추가</span>
                                    <span className="md:hidden">추가</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {isAnswersLoading ? (
                                    <div className="text-center py-4">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                                    </div>
                                ) : answers?.length > 0 ? (
                                    answers.map((answer) => (
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
                                                        <Edit2 className="h-4 w-4"/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAnswer(answer.answer_id)}
                                                        className="p-1 text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-4">
                                        등록된 답변이 없습니다
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-4 md:p-6 text-center text-gray-500">
                        Select a sentence to view details
                    </div>
                )}
            </div>

            {/* 모달 */}
            {isSmallTalkFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg mx-2 p-4 md:p-6 max-h-[90vh] overflow-y-auto">
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

            {isAnswerFormOpen && selectedTalkId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg mx-2 p-4 md:p-6 max-h-[90vh] overflow-y-auto">
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