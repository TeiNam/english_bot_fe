import {useState} from 'react';
import {Navigate} from 'react-router-dom';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {deleteGrammar, getGrammars} from '../api/grammar';
import {GrammarDetail} from '../components/GrammarDetail';
import {ManageGrammarForm} from '../components/ManageGrammarForm';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronUp,
    Edit2,
    Plus,
    Trash2
} from 'lucide-react';
import {useAuthStore} from '../store/authStore';
import {Grammar as GrammarType} from '../types/grammar';

export const Grammar = () => {
    const [selectedGrammarId, setSelectedGrammarId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGrammar, setEditingGrammar] = useState<GrammarType | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const queryClient = useQueryClient();
    const token = useAuthStore((state) => state.token);

    const {data, isLoading} = useQuery({
        queryKey: ['grammars', currentPage, pageSize],
        queryFn: () => getGrammars(currentPage, pageSize)
    });

    const deleteMutation = useMutation({
        mutationFn: deleteGrammar,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['grammars']});
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

    const getPageNumbers = () => {
        if (!data?.total_pages) return [];

        const maxVisiblePages = 5;
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(data.total_pages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < data.total_pages) {
            if (endPage < data.total_pages - 1) pages.push('...');
            pages.push(data.total_pages);
        }

        return pages;
    };

    if (!token) {
        return <Navigate to="/login" replace/>;
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
                    <Plus className="h-4 w-4 mr-2"/>
                    새 문법
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="divide-y divide-gray-200">
                    {data?.items?.map((grammar) => (
                        <div key={grammar.grammar_id} className="divide-y divide-gray-200">
                            <div
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedGrammarId(selectedGrammarId === grammar.grammar_id ? null : grammar.grammar_id)}
                            >
                                <div className="px-6 py-4 flex items-center">
                                    {selectedGrammarId === grammar.grammar_id ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400 mr-2"/>
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400 mr-2"/>
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
                                                    <Edit2 className="h-4 w-4"/>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(grammar.grammar_id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4"/>
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

            {data && data.total_pages > 1 && (
                <div className="mt-6 flex justify-center items-center space-x-2">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="첫 페이지"
                    >
                        <ChevronsLeft className="h-4 w-4"/>
                    </button>
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="이전 페이지"
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </button>

                    {getPageNumbers().map((pageNum, index) => (
                        pageNum === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                        ) : (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(Number(pageNum))}
                                className={`px-3 py-1 rounded-md ${
                                    currentPage === pageNum
                                        ? 'bg-indigo-600 text-white'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {pageNum}
                            </button>
                        )
                    ))}

                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!data || currentPage === data.total_pages}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="다음 페이지"
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </button>
                    <button
                        onClick={() => setCurrentPage(data.total_pages)}
                        disabled={!data || currentPage === data.total_pages}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="마지막 페이지"
                    >
                        <ChevronsRight className="h-4 w-4"/>
                    </button>
                </div>
            )}

            {/* 추가/수정 모달 */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-[95%] max-w-6xl max-h-[95vh] overflow-y-auto">
                        <div className="p-8">
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