import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {deleteOpic, getOpicCounts, getOpics} from '../api/opic';
import {Opic as OpicType, SectionType} from '../types/opic';
import {Edit2, Filter, Plus, Trash2, Volume2} from 'lucide-react';
import {ManageOpicForm} from '../components/ManageOpicForm';

export const Opic = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSection, setSelectedSection] = useState<SectionType | undefined>();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOpic, setEditingOpic] = useState<OpicType | null>(null);
    const queryClient = useQueryClient();
    const pageSize = 10;

    const {data: opicData, isLoading} = useQuery({
        queryKey: ['opics', currentPage, pageSize, selectedSection],
        queryFn: () => getOpics(currentPage, pageSize, selectedSection)
    });

    const {data: opicCounts} = useQuery({
        queryKey: ['opicCounts'],
        queryFn: getOpicCounts
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOpic,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['opics']});
            queryClient.invalidateQueries({queryKey: ['opicCounts']});
        }
    });

    const handleDelete = async (opicId: number) => {
        if (window.confirm('정말로 이 문항을 삭제하시겠습니까?')) {
            await deleteMutation.mutateAsync(opicId);
        }
    };

    const handleEdit = (opic: OpicType) => {
        setEditingOpic(opic);
        setIsFormOpen(true);
    };

    const playTTS = (text: string) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        let voices = synth.getVoices();
        if (voices.length === 0) {
            synth.addEventListener('voiceschanged', () => {
                voices = synth.getVoices();
                setupVoice();
            });
        } else {
            setupVoice();
        }

        function setupVoice() {
            // 선호하는 음성 목록 (우선순위 순)
            const preferredVoices = [
                "Zoe",
                "Daniel",                   // 매우 자연스러운 남성 음성
                "Microsoft David",         // Microsoft 남성 음성
                "Google US English Male"   // 구글 남성 음성
            ];

            const selectedVoice = voices.find(voice =>
                voice.lang.includes('en-US') &&
                preferredVoices.some(preferred => voice.name.includes(preferred))
            );

            if (selectedVoice) {
                utterance.voice = selectedVoice;
                console.log('Selected voice:', selectedVoice.name);
            }

            utterance.lang = 'en-US';
            utterance.rate = 0.9;    // 속도를 약간 낮춰 더 명확하게
            utterance.pitch = 1;     // 기본 피치
            utterance.volume = 1;    // 최대 볼륨

            synth.cancel();
            synth.speak(utterance);
        }
    };

    const getPageNumbers = () => {
        if (!opicData?.total_pages) return [];
        const maxVisiblePages = 5;
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(opicData.total_pages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">OPic</h1>
                <button
                    onClick={() => {
                        setEditingOpic(null);
                        setIsFormOpen(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4 mr-2"/>
                    새 문항
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4 mb-4">
                    <Filter className="h-5 w-5 text-gray-400"/>
                    <div className="space-x-2">
                        <button
                            onClick={() => setSelectedSection(undefined)}
                            className={`px-3 py-1 rounded-full text-sm ${
                                !selectedSection
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            전체 ({opicCounts?.total || 0})
                        </button>
                        <button
                            onClick={() => setSelectedSection('General-Topics')}
                            className={`px-3 py-1 rounded-full text-sm ${
                                selectedSection === 'General-Topics'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            General Topics ({opicCounts?.general_topics_count || 0})
                        </button>
                        <button
                            onClick={() => setSelectedSection('Role-Play')}
                            className={`px-3 py-1 rounded-full text-sm ${
                                selectedSection === 'Role-Play'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Role Play ({opicCounts?.role_play_count || 0})
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {opicData?.items.map((opic) => (
                        <div
                            key={opic.opic_id}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                       <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                           opic.section === 'General-Topics'
                                               ? 'bg-blue-100 text-blue-800'
                                               : 'bg-green-100 text-green-800'
                                       }`}>
                                           {opic.section}
                                       </span>
                                        <span className="text-sm text-gray-500">{opic.survey}</span>
                                    </div>
                                    <p className="text-gray-900">{opic.question}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => playTTS(opic.question)}
                                        className="p-2 text-gray-400 hover:text-gray-600 group"
                                        title="Listen to question"
                                    >
                                        <Volume2 className="h-4 w-4 group-hover:text-blue-500"/>
                                    </button>
                                    <button
                                        onClick={() => handleEdit(opic)}
                                        className="p-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <Edit2 className="h-4 w-4"/>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(opic.opic_id)}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {opicData && opicData.total_pages > 1 && (
                    <div className="mt-6 flex justify-center items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                            ≪
                        </button>
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                            ＜
                        </button>

                        {getPageNumbers().map(pageNum => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
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
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={!opicData || currentPage === opicData.total_pages}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                            ＞
                        </button>
                        <button
                            onClick={() => setCurrentPage(opicData.total_pages)}
                            disabled={!opicData || currentPage === opicData.total_pages}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                            ≫
                        </button>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-3xl w-full p-8">
                        <h2 className="text-2xl font-semibold mb-6">
                            {editingOpic ? '문항 수정' : '새 문항 등록'}
                        </h2>
                        <ManageOpicForm
                            initialData={editingOpic || undefined}
                            onClose={() => {
                                setIsFormOpen(false);
                                setEditingOpic(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};