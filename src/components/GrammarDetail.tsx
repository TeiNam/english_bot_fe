import { useQuery } from '@tanstack/react-query';
import { getGrammar } from '../api/grammar';
import { ExternalLink, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
    grammarId: number;
    onClose: () => void;
}

export const GrammarDetail = ({ grammarId, onClose }: Props) => {
    const { data: grammar, isLoading } = useQuery({
        queryKey: ['grammar', grammarId],
        queryFn: () => getGrammar(grammarId)
    });

    const getYouTubeVideoId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const handleOpenVideo = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!grammar) {
        return (
            <div className="text-center text-red-600 p-4">
                문법 내용을 불러오는데 실패했습니다
            </div>
        );
    }

    const videoId = grammar.url ? getYouTubeVideoId(grammar.url) : null;
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

    return (
        <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{grammar.title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <span className="sr-only">닫기</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {grammar.url && thumbnailUrl && (
                    <div className="mb-6 relative group cursor-pointer" onClick={() => handleOpenVideo(grammar.url!)}>
                        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                            <img
                                src={thumbnailUrl}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // 고화질 썸네일이 없을 경우 기본 썸네일로 대체
                                    const img = e.target as HTMLImageElement;
                                    img.src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                                }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all">
                                <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                                    <Play className="h-8 w-8 text-white" fill="white" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            <span>유튜브에서 보기</span>
                        </div>
                    </div>
                )}

                <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {grammar.body || ''}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};