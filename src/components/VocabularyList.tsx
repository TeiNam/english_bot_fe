import { useState, useEffect, useCallback } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getVocabularies, getVocabularyMeaningCountsByIds, searchVocabularies } from '../api/vocabulary';
import { Book, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit2, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Vocabulary, VocabularyResponse, MeaningCounts } from '../types/vocabulary';

// 타입 정의
interface Vocabulary {
    vocabulary_id: number;
    word: string;
    create_at: string | null;
    meanings?: Array<any>; // TODO: meanings의 실제 타입으로 교체 필요
}

interface VocabulariesResponse {
    items: Vocabulary[];
    total_pages: number;
    current_page: number;
    total_items: number;
}

interface MeaningCounts {
    [key: number]: number;
}

interface Props {
    onSelectVocabulary: (vocabularyId: number) => void;
    selectedVocabularyId: number | null;
    onEdit: (vocabularyId: number) => void;
    onDelete: (vocabularyId: number) => Promise<void>;
    searchQuery?: string;
}

export default function VocabularyList({
                                           onSelectVocabulary,
                                           selectedVocabularyId,
                                           onEdit,
                                           onDelete,
                                           searchQuery = ''
                                       }: Props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const itemsPerPage = 10;

    // 검색어가 변경될 때 페이지를 1로 리셋
    useEffect(() => {
        setSearchParams({ page: '1' });
    }, [searchQuery, setSearchParams]);

    const {
        data,
        isLoading,
        error
    } = useQuery<VocabulariesResponse, Error>({
        queryKey: ['vocabularies', currentPage, itemsPerPage, searchQuery],
        queryFn: () => searchQuery
            ? searchVocabularies(searchQuery, currentPage, itemsPerPage)
            : getVocabularies(currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5분
    });

    const {
        data: meaningCounts,
        isLoading: isMeaningCountsLoading
    } = useQuery<MeaningCounts>({
        queryKey: ['meaning-counts', data?.items?.map(v => v.vocabulary_id)],
        queryFn: async () => {
            if (!data?.items?.length) return {};
            return getVocabularyMeaningCountsByIds(
                data.items.map(v => v.vocabulary_id)
            );
        },
        enabled: !!data?.items?.length,
    });

    const handlePageChange = useCallback((page: number) => {
        setSearchParams({ page: page.toString() });
    }, [setSearchParams]);

    const formatDate = useCallback((dateString: string | null) => {
        if (!dateString) return '날짜 없음';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '날짜 오류';

            return new Intl.DateTimeFormat('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (e) {
            return '날짜 오류';
        }
    }, []);

    const getPageNumbers = useCallback(() => {
        if (!data) return [];

        const maxVisiblePages = 5;
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(data.total_pages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    }, [currentPage, data]);

    if (isLoading || isMeaningCountsLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                단어를 불러오는데 실패했습니다: {error.message}
            </div>
        );
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <div className="text-center text-gray-500 p-4">
                {searchQuery ? '검색 결과가 없습니다' : '등록된 단어가 없습니다'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {data.items.map((vocabulary) => (
                    <div
                        key={vocabulary.vocabulary_id}
                        className={`p-4 rounded-lg border transition-colors ${
                            selectedVocabularyId === vocabulary.vocabulary_id
                                ? 'bg-indigo-50 border-indigo-200'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div
                                className="flex-grow cursor-pointer"
                                onClick={() => onSelectVocabulary(vocabulary.vocabulary_id)}
                            >
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {vocabulary.word}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <Book className="h-4 w-4 mr-1" />
                                        {meaningCounts?.[vocabulary.vocabulary_id] ?? 0} 의미
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {formatDate(vocabulary.create_at)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(vocabulary.vocabulary_id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-500"
                                    aria-label="단어 수정"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await onDelete(vocabulary.vocabulary_id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                    aria-label="단어 삭제"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data.total_pages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="첫 페이지"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="이전 페이지"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {getPageNumbers().map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded-md ${
                                currentPage === pageNum
                                    ? 'bg-indigo-600 text-white'
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === data.total_pages}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="다음 페이지"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handlePageChange(data.total_pages)}
                        disabled={currentPage === data.total_pages}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="마지막 페이지"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}