import React from 'react';
import { DataCard } from '../../../components/DataCard';

export const TradingPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-3xl font-bold text-white mb-6">Trading & Economy</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataCard title="Market Trends" icon={<span>📈</span>}>
                    <div className="p-4 text-gray-400 text-center">
                        Market data integration coming soon (EDDN/Inara).
                    </div>
                </DataCard>

                <DataCard title="Route Planner" icon={<span>🚚</span>}>
                    <div className="p-4 text-gray-400 text-center">
                        Trade route calculator coming soon.
                    </div>
                </DataCard>
            </div>
        </div>
    );
};
