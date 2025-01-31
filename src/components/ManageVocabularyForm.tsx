import React from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createVocabulary, updateVocabulary, getVocabulary } from '../api/vocabulary';
import { Vocabulary, VocabularyMeaning, RuleType } from '../types/vocabulary';
import { Plus, Minus, Info } from 'lucide-react';

interface Props {
    vocabularyId?: number;
    onClose: () => void;
}

export const ManageVocabularyForm = ({ vocabularyId, onClose }: Props) => {
    const queryClient = useQueryClient();

    // 수정 모드일 경우 기존 데이터 로드
    const { data: initialData } = useQuery({
        queryKey: ['vocabulary', vocabularyId],
        queryFn: () => vocabularyId ? getVocabulary(vocabularyId) : null,
        enabled: !!vocabularyId
    });

    const [formData, setFormData] = React.useState({
        word: initialData?.word || '',
        past_tense: initialData?.past_tense || '',
        past_participle: initialData?.past_participle || '',
        rule: initialData?.rule || '규칙' as RuleType,
        meanings: initialData?.meanings?.length ? initialData.meanings.map(m => ({
            meaning: m.meaning || '',
            classes: m.classes || '',
            example: m.example || '',
            parenthesis: m.parenthesis || ''
        })) : [{ meaning: '', classes: '', example: '', parenthesis: '' }]
    });

    const mutation = useMutation({
        mutationFn: (data: typeof formData) =>
            vocabularyId
                ? updateVocabulary(vocabularyId, data)
                : createVocabulary(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['vocabularies'] });
            if (vocabularyId) {
                await queryClient.invalidateQueries({
                    queryKey: ['vocabulary', vocabularyId]
                });
            }
            onClose();
        },
        onError: (error: any) => {
            console.error('Mutation error:', error);
            alert(error.response?.data?.detail || '단어 저장에 실패했습니다.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 데이터 유효성 검사
        if (!formData.word.trim()) {
            alert('단어를 입력해주세요.');
            return;
        }

        if (!formData.meanings.some(m => m.meaning.trim())) {
            alert('최소 하나의 의미를 입력해주세요.');
            return;
        }

        mutation.mutate(formData);
    };

    const addMeaning = () => {
        setFormData(prev => ({
            ...prev,
            meanings: [...prev.meanings, { meaning: '', classes: '', example: '', parenthesis: '' }]
        }));
    };

    const removeMeaning = (index: number) => {
        if (formData.meanings.length > 1) {
            setFormData(prev => ({
                ...prev,
                meanings: prev.meanings.filter((_, i) => i !== index)
            }));
        }
    };

    const updateMeaning = (index: number, field: keyof VocabularyMeaning, value: string) => {
        setFormData(prev => ({
            ...prev,
            meanings: prev.meanings.map((meaning, i) =>
                i === index ? { ...meaning, [field]: value } : meaning
            )
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="word" className="block text-sm font-medium text-gray-700">
                    단어
                </label>
                <input
                    type="text"
                    id="word"
                    value={formData.word}
                    onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="past_tense" className="block text-sm font-medium text-gray-700">
                        과거형
                    </label>
                    <input
                        type="text"
                        id="past_tense"
                        value={formData.past_tense}
                        onChange={(e) => setFormData(prev => ({ ...prev, past_tense: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="past_participle" className="block text-sm font-medium text-gray-700">
                        과거분사
                    </label>
                    <input
                        type="text"
                        id="past_participle"
                        value={formData.past_participle}
                        onChange={(e) => setFormData(prev => ({ ...prev, past_participle: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">규칙/불규칙</label>
                <div className="mt-1 space-x-4">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            value="규칙"
                            checked={formData.rule === '규칙'}
                            onChange={(e) => setFormData(prev => ({ ...prev, rule: e.target.value as RuleType }))}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">규칙</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            value="불규칙"
                            checked={formData.rule === '불규칙'}
                            onChange={(e) => setFormData(prev => ({ ...prev, rule: e.target.value as RuleType }))}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">불규칙</span>
                    </label>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">의미</label>
                    <button
                        type="button"
                        onClick={addMeaning}
                        className="inline-flex items-center px-2 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        의미 추가
                    </button>
                </div>

                {formData.meanings.map((meaning, index) => (
                    <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-lg relative">
                        {formData.meanings.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeMeaning(index)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                의미 {index + 1}
                            </label>
                            <input
                                type="text"
                                value={meaning.meaning}
                                onChange={(e) => updateMeaning(index, 'meaning', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                품사
                            </label>
                            <input
                                type="text"
                                value={meaning.classes}
                                onChange={(e) => updateMeaning(index, 'classes', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                예문
                            </label>
                            <input
                                type="text"
                                value={meaning.example}
                                onChange={(e) => updateMeaning(index, 'example', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center space-x-2">
                                    <Info className="h-4 w-4 text-gray-400" />
                                    <span>부가 설명</span>
                                </div>
                            </label>
                            <textarea
                                value={meaning.parenthesis}
                                onChange={(e) => updateMeaning(index, 'parenthesis', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {mutation.isPending ? '처리중...' : vocabularyId ? '수정' : '등록'}
                </button>
            </div>
        </form>
    );
};