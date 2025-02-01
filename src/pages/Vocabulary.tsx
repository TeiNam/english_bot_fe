import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import VocabularyList from '../components/VocabularyList';
import { VocabularyDetail } from '../components/VocabularyDetail';
import { ManageVocabularyForm } from '../components/ManageVocabularyForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteVocabulary } from '../api/vocabulary';
import { Plus, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Vocabulary = () => {
    const [selectedVocabularyId, setSelectedVocabularyId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [wordSearchQuery, setWordSearchQuery] = useState('');
    const queryClient = useQueryClient();
    const token = useAuthStore((state) => state.token);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const deleteMutation = useMutation({
        mutationFn: deleteVocabulary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vocabularies'] });
            setSelectedVocabularyId(null);
        }
    });

    const handleDelete = async (vocabularyId: number) => {
        if (window.confirm('정말로 이 단어를 삭제하시겠습니까?')) {
            await deleteMutation.mutateAsync(vocabularyId);
        }
    };

    const handleEdit = (vocabularyId: number) => {
        setSelectedVocabularyId(vocabularyId);
        setIsEditMode(true);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <div className="flex justify-between items-center h-[32px]">
                    <h1 className="text-2xl font-bold text-gray-900">Vocabulary</h1>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={wordSearchQuery}
                                onChange={(e) => setWordSearchQuery(e.target.value)}
                                placeholder="단어 검색"
                                className="w-[250px] pl-8 pr-4 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <button
                            onClick={() => setIsAddMode(true)}
                            className="flex items-center px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            새 단어
                        </button>
                    </div>
                </div>
                <div className="h-[20px]" />
                <VocabularyList
                    onSelectVocabulary={setSelectedVocabularyId}
                    selectedVocabularyId={selectedVocabularyId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchQuery={wordSearchQuery}
                />
            </div>
            <div className="lg:sticky lg:top-6">
                <div className="h-[52px]" />
                {isAddMode ? (
                    <div className="bg-white rounded-lg p-6">
                        <ManageVocabularyForm
                            onClose={() => setIsAddMode(false)}
                        />
                    </div>
                ) : selectedVocabularyId ? (
                    isEditMode ? (
                        <div className="bg-white rounded-lg p-6">
                            <ManageVocabularyForm
                                vocabularyId={selectedVocabularyId}
                                onClose={() => setIsEditMode(false)}
                            />
                        </div>
                    ) : (
                        <VocabularyDetail
                            vocabularyId={selectedVocabularyId}
                            onClose={() => setSelectedVocabularyId(null)}
                        />
                    )
                ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                        Select a word to view details
                    </div>
                )}
            </div>
        </div>
    );
};