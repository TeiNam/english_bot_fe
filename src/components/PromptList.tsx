import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrompts, deletePrompt } from '../api/prompt';
import { ManagePromptForm } from './ManagePromptForm';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Prompt } from '../types/prompt';

export const PromptList = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
    const [expandedPromptId, setExpandedPromptId] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const { data: prompts, isLoading } = useQuery({
        queryKey: ['prompts'],
        queryFn: () => getPrompts()
    });

    const deleteMutation = useMutation({
        mutationFn: deletePrompt,
        onSuccess: () => {
            setExpandedPromptId(null);
            queryClient.invalidateQueries({ queryKey: ['prompts'] });
        }
    });

    const handleEdit = (prompt: Prompt) => {
        setEditingPrompt(prompt);
        setIsFormOpen(true);
    };

    const handleDelete = async (promptId: number) => {
        if (window.confirm('정말로 이 프롬프트를 삭제하시겠습니까?')) {
            await deleteMutation.mutateAsync(promptId);
        }
    };

    const handleToggleExpand = (promptId: number) => {
        setExpandedPromptId(expandedPromptId === promptId ? null : promptId);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Prompts</h2>
                <button
                    onClick={() => {
                        setEditingPrompt(null);
                        setIsFormOpen(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    새 프롬프트
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
                {prompts?.map((prompt) => (
                    <div key={prompt.prompt_template_id} className="p-4 hover:bg-gray-50">
                        <div className="cursor-pointer" onClick={() => handleToggleExpand(prompt.prompt_template_id)}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    {expandedPromptId === prompt.prompt_template_id ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {prompt.name}
                                        </h3>
                                        {prompt.description && (
                                            <p className="text-sm text-gray-500">
                                                {prompt.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        prompt.is_active === 'Y'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {prompt.is_active === 'Y' ? '활성화' : '비활성화'}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(prompt);
                                        }}
                                        className="p-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('정말로 이 프롬프트를 삭제하시겠습니까?')) {
                                                deleteMutation.mutateAsync(prompt.prompt_template_id);
                                            }
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {expandedPromptId === prompt.prompt_template_id && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700">시스템 프롬프트:</h4>
                                    <pre className="text-sm text-gray-600 font-mono whitespace-pre-wrap bg-gray-50 p-2 rounded mt-1">
                                        {prompt.system_prompt}
                                    </pre>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700">사용자 프롬프트:</h4>
                                    <pre className="text-sm text-gray-600 font-mono whitespace-pre-wrap bg-gray-50 p-2 rounded mt-1">
                                        {prompt.user_prompt}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {prompts?.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        등록된 프롬프트가 없습니다
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-3xl w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingPrompt ? '프롬프트 수정' : '새 프롬프트 등록'}
                        </h2>
                        <ManagePromptForm
                            initialData={editingPrompt || undefined}
                            onClose={() => {
                                setIsFormOpen(false);
                                setEditingPrompt(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};