import React, { useState } from 'react';
import { SmallTalkList } from '../components/SmallTalkList';
import { SmallTalkDetail } from '../components/SmallTalkDetail';

export const Learn = () => {
    const [selectedTalkId, setSelectedTalkId] = useState<number | null>(null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <div className="h-[32px] flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900">English Sentences</h1>
                </div>
                <div className="h-[20px]" /> {/* 제목과 리스트 사이의 간격 */}
                <SmallTalkList
                    onSelectTalk={setSelectedTalkId}
                    selectedTalkId={selectedTalkId}
                />
            </div>
            <div className="lg:sticky lg:top-6">
                <div className="h-[52px]" /> {/* 제목 영역의 높이만큼 오프셋 추가 */}
                {selectedTalkId ? (
                    <SmallTalkDetail
                        talkId={selectedTalkId}
                        onClose={() => setSelectedTalkId(null)}
                    />
                ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                        Select a sentence to view details
                    </div>
                )}
            </div>
        </div>
    );
};