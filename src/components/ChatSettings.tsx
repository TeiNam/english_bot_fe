import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, X } from 'lucide-react';
import { getChatSettings, updateChatSettings } from '../api/chat';
import { getPrompts } from '../api/prompt';
import { ChatSettings as ChatSettingsType } from '../types/chat';

export const ChatSettings = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [temperatureValue, setTemperatureValue] = useState<number>(0.7);
    const queryClient = useQueryClient();

    const {data: settings, isLoading: isSettingsLoading} = useQuery<ChatSettingsType, Error>({
        queryKey: ['chatSettings'],
        queryFn: getChatSettings,
        onSuccess: (data) => {
            if (data?.temperature) {
                setTemperatureValue(data.temperature);
            }
        }
    });

    const {data: prompts, isLoading: isPromptsLoading} = useQuery({
        queryKey: ['prompts'],
        queryFn: getPrompts
    });

    // 활성화된 프롬프트만 필터링
    const activePrompts = prompts?.filter(prompt => prompt.is_active === 'Y') || [];

    const updateMutation = useMutation({
        mutationFn: updateChatSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['chatSettings']});
            setIsOpen(false);
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newSettings = {
            default_prompt_template_id: Number(formData.get('default_prompt_template_id')),
            model: formData.get('model') as string,
            temperature: temperatureValue, // 상태값 사용
            max_tokens: Number(formData.get('max_tokens'))
        };
        updateMutation.mutate(newSettings);
    };

    // 온체인지 핸들러 추가
    const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTemperatureValue(parseFloat(e.target.value));
    };

    if (isSettingsLoading || isPromptsLoading) return null;

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
                <Settings className="h-4 w-4 mr-2"/>
                설정
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium">채팅 설정</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5"/>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    기본 프롬프트
                                </label>
                                <select
                                    name="default_prompt_template_id"
                                    defaultValue={settings?.default_prompt_template_id}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    {activePrompts.map((prompt) => (
                                        <option key={prompt.prompt_template_id} value={prompt.prompt_template_id}>
                                            {prompt.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    모델
                                </label>
                                <select
                                    name="model"
                                    defaultValue={settings?.model}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="gpt-4o-mini">GPT-4o-Mini</option>
                                    <option value="gpt-4o">GPT-4o</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Temperature
                                </label>
                                <input
                                    type="range"
                                    name="temperature"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={temperatureValue}
                                    onChange={handleTemperatureChange}
                                    className="mt-1 block w-full"
                                />
                                <div className="text-sm text-gray-500 mt-1">
                                    현재 값: {temperatureValue.toFixed(1)}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    최대 토큰
                                </label>
                                <input
                                    type="number"
                                    name="max_tokens"
                                    defaultValue={settings?.max_tokens}
                                    min="1"
                                    max="4000"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {updateMutation.isPending ? '저장 중...' : '저장'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};