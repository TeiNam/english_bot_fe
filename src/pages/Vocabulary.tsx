import {useState} from 'react';
import {Navigate} from 'react-router-dom';
import VocabularyList from '../components/VocabularyList';
import {VocabularyDetail} from '../components/VocabularyDetail';
import {ManageVocabularyForm} from '../components/ManageVocabularyForm';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {deleteVocabulary} from '../api/vocabulary';
import {Plus, Search} from 'lucide-react';
import {useAuthStore} from '../store/authStore';

export const Vocabulary = () => {
    const [selectedVocabularyId, setSelectedVocabularyId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [wordSearchQuery, setWordSearchQuery] = useState('');
    const queryClient = useQueryClient();
    const token = useAuthStore((state) => state.token);

    if (!token) {
        return <Navigate to="/login" replace/>;
    }

    const deleteMutation = useMutation({
        mutationFn: deleteVocabulary,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['vocabularies']});
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="w-full mb-4 md:mb-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Vocabulary</h1>
                    <div
                        className="flex flex-col md:flex-row items-stretch md:items-center w-full md:w-auto gap-2 md:gap-4">
                        <div className="relative flex-grow md:flex-grow-0">
                            <Search
                                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"/>
                            <input
                                type="text"
                                value={wordSearchQuery}
                                onChange={(e) => setWordSearchQuery(e.target.value)}
                                placeholder="Search"
                                className="w-full md:w-[250px] pl-8 text-right pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            onClick={() => setIsAddMode(true)}
                            className="flex items-center justify-center px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Plus className="h-4 w-4 mr-1"/>
                            <span className="hidden md:inline">새 단어</span>
                            <span className="md:hidden">추가</span>
                        </button>
                    </div>
                </div>
                <VocabularyList
                    onSelectVocabulary={setSelectedVocabularyId}
                    selectedVocabularyId={selectedVocabularyId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchQuery={wordSearchQuery}
                />
            </div>

            <div className="w-full md:sticky md:top-6">
                <div className="h-[20px] md:h-[52px]"/>
                {isAddMode ? (
                    <div className="bg-white rounded-lg p-4 md:p-6">
                        <ManageVocabularyForm
                            onClose={() => setIsAddMode(false)}
                        />
                    </div>
                ) : selectedVocabularyId ? (
                    isEditMode ? (
                        <div className="bg-white rounded-lg p-4 md:p-6">
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
                    <div className="bg-gray-50 rounded-lg p-4 md:p-6 text-center text-gray-500">
                        Select a word to view details
                    </div>
                )}
            </div>
        </div>
    );
};