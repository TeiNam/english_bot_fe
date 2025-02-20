import React, {useEffect} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createGrammar, updateGrammar} from '../api/grammar';
import {Grammar} from '../types/grammar';
import {Loader2, Play} from 'lucide-react';

interface Props {
    initialData?: Grammar;
    onClose: () => void;
}

export const ManageGrammarForm = ({initialData, onClose}: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = React.useState({
        title: initialData?.title || '',
        body: initialData?.body || '',
        url: initialData?.url || ''
    });
    const [isFetchingTitle, setIsFetchingTitle] = React.useState(false);
    const [videoId, setVideoId] = React.useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: (data: typeof formData) =>
            initialData
                ? updateGrammar(initialData.grammar_id, data)
                : createGrammar(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['grammars']});
            if (initialData) {
                queryClient.invalidateQueries({
                    queryKey: ['grammar', initialData.grammar_id]
                });
            }
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const getYouTubeVideoId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const fetchYouTubeTitle = async (videoId: string) => {
        try {
            const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            const data = await response.json();
            return data.title;
        } catch (error) {
            console.error('Error fetching YouTube title:', error);
            return null;
        }
    };

    useEffect(() => {
        const newVideoId = formData.url ? getYouTubeVideoId(formData.url) : null;
        setVideoId(newVideoId);

        const fetchTitle = async () => {
            if (newVideoId && !formData.title) {
                setIsFetchingTitle(true);
                try {
                    const title = await fetchYouTubeTitle(newVideoId);
                    if (title) {
                        setFormData(prev => ({...prev, title}));
                    }
                } catch (error) {
                    console.error('Error fetching title:', error);
                } finally {
                    setIsFetchingTitle(false);
                }
            }
        };

        if (newVideoId) {
            fetchTitle();
        }
    }, [formData.url]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 입력 */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    제목
                </label>
                <div className="mt-1 relative">
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                        disabled={isFetchingTitle}
                    />
                    {isFetchingTitle && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400"/>
                        </div>
                    )}
                </div>
            </div>

            {/* URL 입력 */}
            <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    강의 영상 URL
                </label>
                <input
                    type="url"
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({...prev, url: e.target.value}))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="https://youtube.com/..."
                />
            </div>

            {/* YouTube 플레이어 */}
            <div className="w-full h-0 pb-[56.25%] relative">
                {videoId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                    ></iframe>
                ) : (
                    <div
                        className="absolute top-0 left-0 w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <Play className="h-12 w-12 mx-auto mb-2"/>
                            <p>YouTube URL을 입력하면<br/>영상이 여기에 표시됩니다</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 본문 입력 */}
            <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                    내용 (Markdown)
                </label>
                <textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({...prev, body: e.target.value}))}
                    rows={30}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                    placeholder="# 제목&#10;## 부제목&#10;- 목록&#10;1. 번호 목록&#10;```&#10;코드 블록&#10;```"
                />
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending || isFetchingTitle}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {mutation.isPending ? '처리중...' : initialData ? '수정' : '등록'}
                </button>
            </div>
        </form>
    );
};