import React from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createOpic, updateOpic} from '../api/opic';
import {Opic, SectionType} from '../types/opic';

interface Props {
    initialData?: Opic;
    onClose: () => void;
}

export const ManageOpicForm = ({initialData, onClose}: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = React.useState({
        section: initialData?.section || 'General-Topics' as SectionType,
        survey: initialData?.survey || '',
        question: initialData?.question || ''
    });

    const mutation = useMutation({
        mutationFn: (data: typeof formData) =>
            initialData
                ? updateOpic(initialData.opic_id, data)
                : createOpic(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['opics']});
            queryClient.invalidateQueries({queryKey: ['opicCounts']});
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
                <label className="block text-sm font-medium text-gray-700">
                    섹션
                </label>
                <select
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({...prev, section: e.target.value as SectionType}))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    <option value="General-Topics">General Topics</option>
                    <option value="Role-Play">Role Play</option>
                </select>
            </div>

            <div>
                <label htmlFor="survey" className="block text-sm font-medium text-gray-700">
                    서베이
                </label>
                <input
                    type="text"
                    id="survey"
                    value={formData.survey}
                    onChange={(e) => setFormData(prev => ({...prev, survey: e.target.value}))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                    질문
                </label>
                <textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({...prev, question: e.target.value}))}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
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