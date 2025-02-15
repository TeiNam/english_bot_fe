import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDiaries, deleteDiary } from '../api/diary';
import { Calendar, ChevronLeft, ChevronRight, Trash2, Sparkles, Loader2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { Diary } from '../types/diary';

interface Props {
    onEdit: (diary: Diary) => void;
}

export const DiaryList = ({ onEdit }: Props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [analyzingDiaryId, setAnalyzingDiaryId] = useState<number | null>(null);
    const pageSize = 10;
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['diaries', currentPage, pageSize],
        queryFn: () => getDiaries(currentPage, pageSize),
        placeholderData: keepPreviousData,
        staleTime: 5000
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDiary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diaries'] });
            queryClient.invalidateQueries({ queryKey: ['diary'] });
        }
    });

    const handleAIFeedback = async (diaryId: number, body: string) => {
        if (analyzingDiaryId) return;

        setAnalyzingDiaryId(diaryId);
        try {
            // TODO: Implement AI feedback API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            // const feedback = await getAIFeedback(body);
        } catch (error) {
            console.error('AI feedback failed:', error);
        } finally {
            setAnalyzingDiaryId(null);
        }
    };

    const handleDelete = async (diaryId: number) => {
        if (window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
            try {
                await deleteMutation.mutateAsync(diaryId);
            } catch (error) {
                console.error('Failed to delete diary:', error);
                alert('일기 삭제에 실패했습니다.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!data?.items?.length) {
        return (
            <div className="text-center text-gray-500 p-4">
                작성된 일기가 없습니다
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Diaries</h2>
            {data.items.map((diary) => (
                <div
                    key={diary.diary_id}
                    className="bg-white rounded-lg shadow-sm p-4 transition-all duration-200 hover:shadow-md"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(diary.date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onEdit(diary)}
                                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleAIFeedback(diary.diary_id, diary.body)}
                                disabled={analyzingDiaryId === diary.diary_id}
                                className={`p-1 transition-colors ${
                                    analyzingDiaryId === diary.diary_id
                                        ? 'text-indigo-400'
                                        : 'text-gray-400 hover:text-indigo-600'
                                }`}
                            >
                                {analyzingDiaryId === diary.diary_id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                            </button>
                            <button
                                onClick={() => handleDelete(diary.diary_id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="prose max-w-none">
                        <p className="text-gray-900 whitespace-pre-wrap">{diary.body}</p>
                    </div>
                    {diary.feedback && (
                        <div className="mt-3 p-3 bg-indigo-50 rounded-md">
                            <p className="text-sm text-indigo-700 whitespace-pre-wrap">
                                {diary.feedback}
                            </p>
                        </div>
                    )}
                </div>
            ))}

            {data.total_pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={!data.has_prev}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {data.page} of {data.total_pages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(data.total_pages, p + 1))}
                        disabled={!data.has_next}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
};