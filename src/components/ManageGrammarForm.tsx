import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGrammar, updateGrammar } from '../api/grammar';
import { Grammar } from '../types/grammar';

interface Props {
    initialData?: Grammar;
    onClose: () => void;
}

export const ManageGrammarForm = ({ initialData, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = React.useState({
        title: initialData?.title || '',
        body: initialData?.body || '',
        url: initialData?.url || ''
    });

    const mutation = useMutation({
        mutationFn: (data: typeof formData) =>
            initialData
                ? updateGrammar(initialData.grammar_id, data)
                : createGrammar(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grammars'] });
            if (initialData) {
                queryClient.invalidateQueries({
                    queryKey: ['grammar', initialData.grammar_id]
                });
            }
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
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    제목
                </label>
                <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    강의 영상 URL
                </label>
                <input
                    type="url"
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="https://youtube.com/..."
                />
            </div>

            <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                    내용 (Markdown)
                </label>
                <textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    rows={15}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                    placeholder="# 제목&#10;## 부제목&#10;- 목록&#10;1. 번호 목록&#10;```&#10;코드 블록&#10;```"
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