import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGrammars, deleteGrammar } from '../api/grammar';
import { GrammarDetail } from '../components/GrammarDetail';
import { ManageGrammarForm } from '../components/ManageGrammarForm';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Grammar as GrammarType } from '../types/grammar';

export const Grammar = () => {
    const [selectedGrammarId, setSelectedGrammarId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGrammar, setEditingGrammar] = useState<GrammarType | null>(null);
    const queryClient = useQueryClient();
    const token = useAuthStore((state) => state.token);

    const { data: grammars, isLoading } = useQuery({
        queryKey: ['grammars'],
        queryFn: () => getGrammars()
    });

    const deleteMutation = useMutation({
        mutationFn: deleteGrammar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grammars'] });
            setSelectedGrammarId(null);
        }
    });

    const handleDelete = async (grammarId: number) => {
        if (window.confirm('정말로 이 문법을 삭제하시겠습니까?')) {
            await deleteMutation.mutateAsync(grammarId);
        }
    };

    const handleEdit = (grammar: GrammarType) => {
        setEditingGrammar(grammar);
        setIsFormOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Grammar</h1>
                <button
                    onClick={() => {
                        setEditingGrammar(null);
                        setIsFormOpen(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    새 문법
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="divide-y divide-gray-200">
                    {grammars?.map((grammar) => (
                        <div key={grammar.grammar_id} className="divide-y divide-gray-200">
                            <div
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedGrammarId(selectedGrammarId === grammar.grammar_id ? null : grammar.grammar_id)}
                            >
                                <div className="px-6 py-4 flex items-center">
                                    {selectedGrammarId === grammar.grammar_id ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400 mr-2" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
                                    )}
                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="text-lg font-medium text-gray-900">
                                            {grammar.title}
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-500">
                                                {formatDate(grammar.create_at)}
                                            </span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(grammar);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(grammar.grammar_id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {selectedGrammarId === grammar.grammar_id && (
                                <div className="px-6 py-4 bg-gray-50">
                                    <GrammarDetail
                                        grammarId={grammar.grammar_id}
                                        onClose={() => setSelectedGrammarId(null)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 추가/수정 모달 */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {editingGrammar ? '문법 수정' : '새 문법 등록'}
                            </h2>
                            <ManageGrammarForm
                                initialData={editingGrammar || undefined}
                                onClose={() => {
                                    setIsFormOpen(false);
                                    setEditingGrammar(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};