import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDiary, updateDiary } from '../api/diary';
import { Loader2, Send, X } from 'lucide-react';
import { Diary } from '../types/diary';

interface Props {
    initialDiary?: Diary | null;
    onSaved?: () => void;
}

export const DiaryEditor = ({ initialDiary, onSaved }: Props) => {
    const [body, setBody] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (initialDiary) {
            setBody(initialDiary.body);
            setSelectedDate(initialDiary.date);
        }
    }, [initialDiary]);

    const createMutation = useMutation({
        mutationFn: createDiary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diaries'] });
            setBody('');
            onSaved?.();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: { body: string } }) =>
            updateDiary(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diaries'] });
            if (initialDiary) {
                queryClient.invalidateQueries({ queryKey: ['diary', initialDiary.date] });
            }
            setBody('');
            onSaved?.();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;

        if (initialDiary) {
            updateMutation.mutate({
                id: initialDiary.diary_id,
                data: { body }
            });
        } else {
            createMutation.mutate({
                date: selectedDate,
                body: body.trim()
            });
        }
    };

    const handleCancel = () => {
        setBody('');
        setSelectedDate(new Date().toISOString().split('T')[0]);
        onSaved?.();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                        {initialDiary ? 'Edit Diary' : 'New Diary'}
                    </h3>
                    {initialDiary && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="p-1 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="diary-date" className="block text-sm font-medium text-gray-700">
                        날짜 선택
                    </label>
                    <input
                        type="date"
                        id="diary-date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        disabled={!!initialDiary}
                        className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <textarea
                    id="diary-content"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Write your diary in English..."
                />

                <div className="flex justify-end space-x-3">
                    {initialDiary && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending || !body.trim()}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {createMutation.isPending || updateMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                {initialDiary ? 'Update' : 'Save'} Diary
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};