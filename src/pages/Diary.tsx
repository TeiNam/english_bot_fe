import {DiaryEditor} from '../components/DiaryEditor';
import {DiaryList} from '../components/DiaryList';
import {useState} from 'react';
import {Diary as DiaryType} from '../types/diary';

export const Diary = () => {
    const [editingDiary, setEditingDiary] = useState<DiaryType | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">English Diary</h1>
            </div>
            <div className="space-y-6">
                <DiaryEditor
                    initialDiary={editingDiary}
                    onSaved={() => setEditingDiary(null)}
                />
                <DiaryList onEdit={setEditingDiary}/>
            </div>
        </div>
    );
};