import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSmallTalk, updateSmallTalk } from '../api/smallTalk';
import { SmallTalk } from '../types/smallTalk';

interface Props {
    initialData?: SmallTalk;
    onClose: () => void;
}

export const ManageSmallTalkForm = ({ initialData, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = React.useState({
        eng_sentence: initialData?.eng_sentence || '',
        kor_sentence: initialData?.kor_sentence || '',
        parenthesis: initialData?.parenthesis || '',
        tag: initialData?.tag || ''
    });

    const mutation = useMutation({
        mutationFn: (data: typeof formData) =>
            initialData
                ? updateSmallTalk(initialData.talk_id, data)
                : createSmallTalk(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['smallTalks'] });
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
                    영어 문장
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
                    한글 문장
                </label>
                <input
                    type="text"
                    id="kor_sentence"
                    value={formData.kor_sentence}
                    onChange={(e) => setFormData(prev => ({ ...prev, kor_sentence: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="parenthesis" className="block text-sm font-medium text-gray-700">
                    부가 설명
                </label>
                <textarea
                    id="parenthesis"
                    value={formData.parenthesis}
                    onChange={(e) => setFormData(prev => ({ ...prev, parenthesis: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="tag" className="block text-sm font-medium text-gray-700">
                    태그
                </label>
                <input
                    type="text"
                    id="tag"
                    value={formData.tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
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