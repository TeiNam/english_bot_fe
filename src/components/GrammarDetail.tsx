import {useQuery} from '@tanstack/react-query';
import {getGrammar} from '../api/grammar';
import {Play} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
    grammarId: number;
    onClose: () => void;
}

export const GrammarDetail = ({grammarId, onClose}: Props) => {
    const {data: grammar, isLoading} = useQuery({
        queryKey: ['grammar', grammarId],
        queryFn: () => getGrammar(grammarId)
    });

    const getYouTubeVideoId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {grammar.url && (
                    <div className="mb-6">
                        <div className="w-full h-0 pb-[56.25%] relative rounded-lg overflow-hidden">
                            {videoId ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute top-0 left-0 w-full h-full"
                                ></iframe>
                            ) : (
                                <div
                                    className="absolute top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <Play className="h-12 w-12 mx-auto mb-2"/>
                                        <p>동영상을 불러올 수 없습니다</p>
                                    </div>
                                </div>
                            )}
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