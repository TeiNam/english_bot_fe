import {useState} from 'react';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {getSmallTalks} from '../api/smallTalk';
import {getAnswerCounts} from '../api/answer';
import {Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MessageSquare, Tag} from 'lucide-react';

interface Props {
    onSelectTalk: (talkId: number) => void;
    selectedTalkId: number | null;
    pageSize?: number; // Add optional pageSize prop
}

export const SmallTalkList = ({onSelectTalk, selectedTalkId, pageSize = 10}: Props) => {
    const [currentPage, setCurrentPage] = useState<number>(1);

    const {data, isLoading, error} = useQuery({
        queryKey: ['smallTalks', currentPage, pageSize],
        queryFn: () => getSmallTalks(currentPage, pageSize),
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

    // 로딩 상태 최적화
    if (isLoading) {
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
                스몰톡을 불러오는데 실패했습니다
            </div>
        );
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <div className="text-center text-gray-500 p-4">
                등록된 문장이 없습니다
            </div>
        );
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const formatDate = (dateString: string | null) => {
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
    };

    // 페이지 번호 목록 생성
    const getPageNumbers = () => {
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
    };

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
                <div className="flex justify-center items-center space-x-2">
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
            )}
        </div>
    );
};