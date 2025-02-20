import {BotControlPanel} from '../components/BotControlPanel';
import {PromptList} from '../components/PromptList';

export const Manage = () => {
    return (
        <div className="space-y-6">
            <PromptList/>
            <h2 className="text-xl font-bold text-gray-900">Bot Status</h2>
            <BotControlPanel/>
        </div>
    );
};