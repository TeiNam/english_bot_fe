import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAnswer, updateAnswer } from '../api/answer';
import { Answer } from '../types/smallTalk';

interface Props {
    talkId: number;
    initialData?: Answer;
    onClose: () => void;
}

export const ManageAnswerForm = ({ talkId, initialData, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = React.useState({
        eng_sentence: initialData?.eng_sentence || '',
        kor_sentence: initialData?.kor_sentence || '',
        talk_id: talkId
    });

    const mutation = useMutation({
        mutationFn: (data: typeof formData) =>
            initialData
                ? updateAnswer(initialData.answer_id, data)
                : createAnswer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['answers', talkId] });
            queryClient.invalidateQueries({ queryKey: ['answerCounts'] });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="eng_sentence" className="block text-sm font-medium text-gray-700">
                    영어 답변
                </label>
                <input
                    type="text"
                    id="eng_sentence"
                    value={formData.eng_sentence}
                    onChange={(e) => setFormData(prev => ({ ...prev, eng_sentence: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="kor_sentence" className="block text-sm font-medium text-gray-700">
                    한글 답변
                </label>
                <input
                    type="text"
                    id="kor_sentence"
                    value={formData.kor_sentence}
                    onChange={(e) => setFormData(prev => ({ ...prev, kor_sentence: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
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
                    {mutation.isPending ? '처리중...' : initialData ? '수정' : '등록'}
                </button>
            </div>
        </form>
    );
};