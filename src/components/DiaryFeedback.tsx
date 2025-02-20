import {useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {Loader2, Sparkles} from 'lucide-react';

export const DiaryFeedback = () => {
    const [selectedDiary, setSelectedDiary] = useState<string | null>(null);

    // TODO: Implement AI analysis mutation
    const analysisMutation = useMutation({
        mutationFn: async (diaryText: string) => {
            // API call for AI analysis will go here
            return new Promise(resolve => setTimeout(resolve, 2000));
        }
    });

    const handleAnalyze = () => {
        if (selectedDiary) {
            analysisMutation.mutate(selectedDiary);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">AI Feedback</h2>
            <div className="space-y-4">
                <textarea
                    value={selectedDiary || ''}
                    onChange={(e) => setSelectedDiary(e.target.value)}
                    placeholder="Paste your diary text here for AI analysis..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={4}
                />
                <button
                    onClick={handleAnalyze}
                    disabled={!selectedDiary || analysisMutation.isPending}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {analysisMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2"/>
                            Analyze with AI
                        </>
                    )}
                </button>

                {analysisMutation.isSuccess && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Analysis Result</h3>
                        <p className="text-sm text-gray-600">
                            AI analysis result will be displayed here...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};