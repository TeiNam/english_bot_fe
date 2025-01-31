import { BotControlPanel } from '../components/BotControlPanel';

export const Manage = () => {
    return (
        <div className="space-y-6">
            <div className="h-[32px] flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Bot Status</h1>
            </div>
            <BotControlPanel />
        </div>
    );
};