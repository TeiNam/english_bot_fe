import React from 'react';
import { Info } from 'lucide-react';
import { VocabularyMeaning } from '../types/vocabulary';

interface Props {
    initialData?: Omit<VocabularyMeaning, 'meaning_id' | 'order_no'>;
    onSubmit: (data: Omit<VocabularyMeaning, 'meaning_id' | 'order_no'>) => void;
    onClose: () => void;
}

export default function ManageVocabularyMeaningForm({ initialData, onSubmit, onClose }: Props) {
    const [formData, setFormData] = React.useState({
        meaning: initialData?.meaning || '',
        classes: initialData?.classes || '',
        example: initialData?.example || '',
        parenthesis: initialData?.parenthesis || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.meaning.trim()) {
            alert('의미를 입력해주세요.');
            return;
        }

        // Process the data to remove empty example
        const processedData = { ...formData };
        if (!processedData.example.trim()) {
            delete processedData.example;
        }

        onSubmit(processedData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    의미
                </label>
                <input
                    type="text"
                    value={formData.meaning}
                    onChange={(e) => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    품사
                </label>
                <input
                    type="text"
                    value={formData.classes}
                    onChange={(e) => setFormData(prev => ({ ...prev, classes: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    예문
                </label>
                <input
                    type="text"
                    value={formData.example}
                    onChange={(e) => setFormData(prev => ({ ...prev, example: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="예문을 입력하세요 (선택사항)"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-gray-400" />
                        <span>부가 설명</span>
                    </div>
                </label>
                <textarea
                    value={formData.parenthesis}
                    onChange={(e) => setFormData(prev => ({ ...prev, parenthesis: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

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
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {initialData ? '수정' : '추가'}
                </button>
            </div>
        </form>
    );
}