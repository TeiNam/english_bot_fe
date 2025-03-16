import {useCallback, useEffect, useMemo, useState} from 'react';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {getVocabularies, getVocabularyMeaningCountsByIds, searchVocabularies} from '../api/vocabulary';
import {Book, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit2, Trash2} from 'lucide-react';
import {useSearchParams} from 'react-router-dom';
import {MeaningCounts, Vocabulary} from '../types/vocabulary';

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
    page: number;
    total: number;
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
    // 화면 크기에 따라 아이템 수 조정 (기본값은 PC에서 10개, 모바일에서는 5개)
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isMobile, setIsMobile] = useState(false);

    // 디버깅: 페이지 변경 추적
    useEffect(() => {
        console.log('Current Page:', currentPage);
        console.log('Search Params:', Object.fromEntries(searchParams.entries()));
    }, [currentPage, searchParams]);

    // 화면 크기에 따라 itemsPerPage 조정
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            console.log('화면 크기 변경 - window.innerWidth:', window.innerWidth, '모바일?', mobile);
            setIsMobile(mobile);
            // 모바일에서는 5개, 웹에서는 항상 10개로 설정
            setItemsPerPage(mobile ? 5 : 10);
        };

        // 초기 설정 및 리사이즈 이벤트 리스너 등록
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 검색어가 변경될 때 페이지를 1로 리셋
    useEffect(() => {
        if (searchQuery) {
            setSearchParams({page: '1'});
        }
    }, [searchQuery, setSearchParams]);

    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery<VocabulariesResponse, Error>({
        queryKey: ['vocabularies', currentPage, itemsPerPage, searchQuery],
        queryFn: async () => {
            console.log('API 호출 시작 - Page:', currentPage, 'Size:', itemsPerPage, 'Query:', searchQuery);

            try {
                const result = searchQuery
                    ? await searchVocabularies(searchQuery, currentPage, itemsPerPage)
                    : await getVocabularies(currentPage, itemsPerPage);

                // 서버 응답 로그
                console.log('API 응답 성공:', {
                    current_page: result.page,
                    total_pages: result.total_pages,
                    total_items: result.total,
                    item_count: result.items.length
                });
                
                return result;
            } catch (error) {
                console.error('API 호출 오류:', error);
                throw error;
            }
        },
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
            console.log('의미 개수 API 호출 - 단어 IDs:', data.items.map(v => v.vocabulary_id));
            return getVocabularyMeaningCountsByIds(
                data.items.map(v => v.vocabulary_id)
            );
        },
        enabled: !!data?.items?.length,
    });

    const handlePageChange = useCallback((page: number) => {
        console.log('페이지 변경 요청:', page);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);

        // 페이지 변경 시 화면 상단으로 스크롤 및 데이터 갱신
        window.scrollTo(0, 0);
        refetch();
    }, [searchParams, setSearchParams, refetch]);

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

    // 페이지 번호 계산을 메모이제이션
    const pageNumbers = useMemo(() => {
        if (!data) return [];

        const maxVisiblePages = isMobile ? 3 : 5; // 모바일에서는 페이지 버튼 3개만 표시
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(data.total_pages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        console.log('페이지 번호 계산:', {
            currentPage,
            totalPages: data.total_pages,
            calculated: pages
        });

        return pages;
    }, [currentPage, data, isMobile]);

    // 페이지 정보 텍스트 (전체 중 현재 몇 페이지인지) 메모이제이션
    const paginationInfo = useMemo(() => {
        if (!data) return '';
        const info = `${data.page} / ${data.total_pages} 페이지 (총 ${data.total}개)`;
        console.log('페이지네이션 정보:', info);
        return info;
    }, [data]);

    // 페이지네이션이 필요한지 여부를 결정하는 함수
    const shouldShowPagination = useMemo(() => {
        if (!data) return false;
        
        // 총 아이템 수가 itemsPerPage보다 많거나, 총 페이지가 1보다 크면 페이지네이션 표시
        const showPagination = data.total > itemsPerPage || data.total_pages > 1;
        
        // 웹에서는 항상 페이지네이션 표시 (아이템이 10개 미만이라도)
        const forceShowPagination = !isMobile && data.items.length > 0;
        
        console.log('페이지네이션 표시 여부:', showPagination || forceShowPagination, {
            total: data.total,
            itemsPerPage,
            totalPages: data.total_pages,
            forceShow: forceShowPagination
        });
        
        return showPagination || forceShowPagination;
    }, [data, itemsPerPage, isMobile]);

    if (isLoading || isMeaningCountsLoading) {
        // 모바일에서는 5개, 데스크톱에서는 10개의 로딩 스켈레톤 표시
        const skeletonCount = isMobile ? 5 : 10; 
        console.log('로딩 중...', { isMobile, skeletonCount });
        return (
            <div className="space-y-4">
                {[...Array(skeletonCount)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        console.error('데이터 로딩 오류:', error);
        return (
            <div className="text-center text-red-600 p-4">
                단어를 불러오는데 실패했습니다: {error.message}
            </div>
        );
    }

    console.log('렌더링 데이터:', {
        items: data?.items?.length || 0,
        page: data?.page,
        totalPages: data?.total_pages,
        shouldShowPagination
    });

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
                {/* 실제 단어 항목 표시 */}
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
                                        <Book className="h-4 w-4 mr-1"/>
                                        {meaningCounts?.[vocabulary.vocabulary_id] ?? 0} 의미
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1"/>
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
                                    <Edit2 className="h-4 w-4"/>
                                </button>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await onDelete(vocabulary.vocabulary_id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                    aria-label="단어 삭제"
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* 웹에서는 항상 10개 항목을 표시하기 위한 빈 항목 */}
                {!isMobile && data.items.length < 10 && (
                    <>
                        {[...Array(10 - data.items.length)].map((_, index) => (
                            <div
                                key={`dummy-${index}`}
                                className="p-4 rounded-lg border border-gray-100 bg-gray-50"
                            >
                                <div className="h-16 flex items-center justify-center text-gray-300">
                                    <span className="italic">빈 항목</span>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {shouldShowPagination && (
                <div className="flex flex-col space-y-2">
                    {/* 디버깅 정보 */}
                    <div className="text-xs text-gray-400 text-center">
                        디버깅: 현재페이지={data.page}, 총페이지={data.total_pages}, 항목수={data.items.length}, 총항목수={data.total}, 모바일={isMobile ? '예' : '아니오'}
                    </div>

                    {/* 데스크톱용 페이지네이션 */}
                    <div className="hidden md:flex justify-center items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="첫 페이지"
                        >
                            <ChevronsLeft className="h-4 w-4"/>
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="이전 페이지"
                        >
                            <ChevronLeft className="h-4 w-4"/>
                        </button>

                        {pageNumbers.map(pageNum => (
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
                            <ChevronRight className="h-4 w-4"/>
                        </button>
                        <button
                            onClick={() => handlePageChange(data.total_pages)}
                            disabled={currentPage === data.total_pages}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="마지막 페이지"
                        >
                            <ChevronsRight className="h-4 w-4"/>
                        </button>
                    </div>

                    {/* 모바일용 페이지네이션 - 버튼 방식 */}
                    <div className="flex md:hidden justify-center items-center space-x-1">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="첫 페이지"
                        >
                            <ChevronsLeft className="h-4 w-4"/>
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="이전 페이지"
                        >
                            <ChevronLeft className="h-4 w-4"/>
                        </button>

                        <div className="px-2 text-sm">
                            <span className="font-medium">{paginationInfo}</span>
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === data.total_pages}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="다음 페이지"
                        >
                            <ChevronRight className="h-4 w-4"/>
                        </button>
                        <button
                            onClick={() => handlePageChange(data.total_pages)}
                            disabled={currentPage === data.total_pages}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="마지막 페이지"
                        >
                            <ChevronsRight className="h-4 w-4"/>
                        </button>
                    </div>

                    {/* 페이지 정보 (데스크톱에서만 표시) */}
                    <div className="hidden md:flex justify-center mt-2 text-sm text-gray-500">
                        {paginationInfo}
                    </div>
                </div>
            )}
        </div>
    );
}