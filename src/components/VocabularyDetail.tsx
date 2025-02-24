import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getVocabulary, updateVocabulary} from '../api/vocabulary';
import {Book, Edit2, Info, Plus, Trash2} from 'lucide-react';
import ManageVocabularyMeaningForm from './ManageVocabularyMeaningForm';
import {useState} from 'react';
import {VocabularyMeaning} from '../types/vocabulary';

interface Props {
    vocabularyId: number;
    onClose: () => void;
}

export const VocabularyDetail = ({vocabularyId, onClose}: Props) => {
    const [isAddingMeaning, setIsAddingMeaning] = useState(false);
    const [editingMeaning, setEditingMeaning] = useState<VocabularyMeaning | null>(null);
    const queryClient = useQueryClient();

    const {data: vocabulary, isLoading} = useQuery({
        queryKey: ['vocabulary', vocabularyId],
        queryFn: () => getVocabulary(vocabularyId)
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedVocabulary: any) => {
            return updateVocabulary(vocabularyId, updatedVocabulary);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['vocabulary', vocabularyId]});
        }
    });

    const handleDeleteMeaning = async (meaningId: number) => {
        if (!vocabulary) return;
        if (vocabulary.meanings.length <= 1) {
            alert('단어는 최소 하나의 의미를 가져야 합니다. 단어를 삭제하려면 단어 자체를 삭제해주세요.');
            return;
        }
        if (window.confirm('정말로 이 의미를 삭제하시겠습니까?')) {
            const updatedVocabulary = {
                ...vocabulary,
                meanings: vocabulary.meanings.filter(m => m.meaning_id !== meaningId)
            };
            await updateMutation.mutateAsync(updatedVocabulary);
        }
    };

    const handleEditMeaning = (meaning: VocabularyMeaning) => {
        setEditingMeaning(meaning);
        setIsAddingMeaning(true);
    };

    const handleUpdateMeaning = async (meaningData: Omit<VocabularyMeaning, 'meaning_id' | 'order_no'>) => {
        if (!vocabulary || !editingMeaning) return;

        const updatedVocabulary = {
            ...vocabulary,
            meanings: vocabulary.meanings.map(m =>
                m.meaning_id === editingMeaning.meaning_id
                    ? {...m, ...meaningData}
                    : m
            )
        };

        await updateMutation.mutateAsync(updatedVocabulary);
        setIsAddingMeaning(false);
        setEditingMeaning(null);
    };

    const addMeaningMutation = useMutation({
        mutationFn: async (newMeaning: Omit<VocabularyMeaning, 'meaning_id' | 'order_no'>) => {
            if (!vocabulary) return;
            const updatedVocabulary = {
                ...vocabulary,
                meanings: [...vocabulary.meanings, {
                    ...newMeaning,
                    meaning_id: Date.now(),
                    order_no: vocabulary.meanings.length + 1
                }]
            };
            return updateVocabulary(vocabularyId, updatedVocabulary);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['vocabulary', vocabularyId]});
            setIsAddingMeaning(false);
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!vocabulary) {
        return (
            <div className="text-center text-red-600 p-4">
                단어를 불러오는데 실패했습니다
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{vocabulary.word}</h2>
                        {(vocabulary.past_tense || vocabulary.past_participle) && (
                            <div className="mt-2 text-sm text-gray-600">
                                {vocabulary.past_tense && (
                                    <span className="mr-4">과거형: {vocabulary.past_tense}</span>
                                )}
                                {vocabulary.past_participle && (
                                    <span>과거분사: {vocabulary.past_participle}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <span className="sr-only">닫기</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <Book className="h-5 w-5 mr-2"/>
                        의미
                    </h3>
                    <button
                        onClick={() => {
                            setEditingMeaning(null);
                            setIsAddingMeaning(true);
                        }}
                        className="flex items-center px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="h-4 w-4 mr-1"/>
                        의미 추가
                    </button>
                </div>

                <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                    {vocabulary.meanings.map((meaning) => (
                        <div
                            key={meaning.meaning_id}
                            className="border-l-4 border-indigo-200 pl-4 py-2 relative hover:bg-gray-50 transition-colors"
                        >
                            <div className="absolute top-2 right-2 flex space-x-2">
                                <button
                                    onClick={() => handleEditMeaning(meaning)}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <Edit2 className="h-4 w-4"/>
                                </button>
                                <button
                                    onClick={() => handleDeleteMeaning(meaning.meaning_id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </button>
                            </div>
                            <div className="space-y-2 pr-16">
                                <div className="flex items-center space-x-2">
                                    {meaning.classes && (
                                        <span className="text-sm font-medium text-gray-500">
                                            [{meaning.classes}]
                                        </span>
                                    )}
                                    <p className="text-gray-900">{meaning.meaning}</p>
                                </div>
                                {meaning.example ? (
                                    <p className="text-sm text-gray-600 italic">
                                        "{meaning.example}"
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        예문 없음
                                    </p>
                                )}
                                {meaning.parenthesis && (
                                    <div
                                        className="flex items-start space-x-2 text-sm text-gray-500 bg-gray-50 p-3 rounded">
                                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0"/>
                                        <pre
                                            className="whitespace-pre-wrap font-sans break-words flex-grow">{meaning.parenthesis}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 의미 추가/수정 모달 */}
            {isAddingMeaning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingMeaning ? '의미 수정' : '새 의미 추가'}
                        </h2>
                        <ManageVocabularyMeaningForm
                            initialData={editingMeaning || undefined}
                            onSubmit={(meaningData) => {
                                if (editingMeaning) {
                                    handleUpdateMeaning(meaningData);
                                } else {
                                    addMeaningMutation.mutate(meaningData);
                                }
                            }}
                            onClose={() => {
                                setIsAddingMeaning(false);
                                setEditingMeaning(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};