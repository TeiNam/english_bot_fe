import {useCallback, useEffect, useMemo, useState} from 'react';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {getSmallTalks, searchSmallTalks} from '../api/smallTalk';
import {getAnswerCounts} from '../api/answer';
import {Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MessageSquare, Tag} from 'lucide-react';

interface Props {
    onSelectTalk: (talkId: number) => void;
    selectedTalkId: number | null;
    pageSize?: number;
    searchQuery?: string;
}

export const SmallTalkList = ({onSelectTalk, selectedTalkId, pageSize = 10, searchQuery = ''}: Props) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState(pageSize);
    const [isMobile, setIsMobile] = useState(false);

    // 화면 크기에 따라 itemsPerPage 조정
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setItemsPerPage(mobile ? 5 : pageSize);
        };

        // 초기 설정 및 리사이즈 이벤트 리스너 등록
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [pageSize]);

    const {data, isLoading, error} = useQuery({
        queryKey: ['smallTalks', currentPage, itemsPerPage, searchQuery],
        queryFn: () => searchQuery
            ? searchSmallTalks(searchQuery, currentPage, itemsPerPage)
            : getSmallTalks(currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5분
    });

    // 답변 개수를 가져오는 쿼리 최적화
    const {data: answerCountsData} = useQuery({
        queryKey: ['answerCounts', data?.items?.map(talk => talk.talk_id).join(',')],
        queryFn: async () => {
            if (!data?.items?.length) return {};
            const talkIds = data.items.map(talk => talk.talk_id);
            return getAnswerCounts(talkIds);
        },
        enabled: !!data?.items?.length,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false
    });

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // 페이지 변경 시 화면 상단으로 스크롤
        window.scrollTo(0, 0);
    }, []);

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
        return pages;
    }, [currentPage, data, isMobile]);

    // 페이지 정보 텍스트 메모이제이션
    const paginationInfo = useMemo(() => {
        if (!data) return '';
        // total_items 대신 total 사용
        return `${currentPage} / ${data.total_pages} 페이지 (총 ${data.total}개)`;
    }, [currentPage, data]);

    // 로딩 상태 최적화
    if (isLoading) {
        // 모바일에서는 3개, 데스크톱에서는 5개의 로딩 스켈레톤 표시
        const skeletonCount = isMobile ? 3 : 5;
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
        return (
            <div className="text-center text-red-600 p-4">
                스몰톡을 불러오는데 실패했습니다
            </div>
        );
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <div className="text-center text-gray-500 p-4">
                {searchQuery ? '검색 결과가 없습니다' : '등록된 문장이 없습니다'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {data.items.map((talk) => (
                    <div
                        key={talk.talk_id}
                        onClick={() => onSelectTalk(talk.talk_id)}
                        className={`cursor-pointer p-4 rounded-lg border transition-colors ${
                            selectedTalkId === talk.talk_id
                                ? 'bg-indigo-50 border-indigo-200'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {talk.eng_sentence}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1"/>
                                {answerCountsData?.[talk.talk_id] ?? 0} 답변
                            </span>
                            <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1"/>
                                {formatDate(talk.create_at)}
                            </span>
                            {talk.tag && (
                                <span className="flex items-center">
                                    <Tag className="h-4 w-4 mr-1"/>
                                    {talk.tag}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {data.total_pages > 1 && (
                <div className="flex flex-col space-y-2">
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
};