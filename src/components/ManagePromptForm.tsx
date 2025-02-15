import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPrompt, updatePrompt } from '../api/prompt';
import { Prompt } from '../types/prompt';

interface Props {
    initialData?: Prompt;
    onClose: () => void;
}

export const ManagePromptForm = ({ initialData, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = React.useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        system_prompt: initialData?.system_prompt || '',
        user_prompt: initialData?.user_prompt || '',
        is_active: initialData?.is_active || 'Y'
    });

    const mutation = useMutation({
        mutationFn: (data: typeof formData) =>
            initialData
                ? updatePrompt(initialData.prompt_template_id, data)
                : createPrompt(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prompts'] });
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    이름
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    설명
                </label>
                <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-700">
                    시스템 프롬프트
                </label>
                <textarea
                    id="system_prompt"
                    value={formData.system_prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                    rows={5}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                    required
                />
            </div>

            <div>
                <label htmlFor="user_prompt" className="block text-sm font-medium text-gray-700">
                    사용자 프롬프트
                </label>
                <textarea
                    id="user_prompt"
                    value={formData.user_prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, user_prompt: e.target.value }))}
                    rows={5}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    활성화 상태
                </label>
                <div className="mt-2 space-x-4">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            value="Y"
                            checked={formData.is_active === 'Y'}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value }))}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">활성화</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            value="N"
                            checked={formData.is_active === 'N'}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value }))}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">비활성화</span>
                    </label>
                </div>
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