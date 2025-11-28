import React from 'react';
import { DataCard } from '../../../components/DataCard';
import { GalnetNews } from '../../../components/widgets/GalnetNews';

export const CommunityPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-3xl font-bold text-white mb-6">Community & News</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <GalnetNews />
                </div>

                <div className="space-y-6">
                    <DataCard title="Community Goals" icon={<span>🎯</span>}>
                        <div className="p-4 text-gray-400 text-center">
                            Active Community Goals coming soon (Inara).
                        </div>
                    </DataCard>
                </div>
            </div>
        </div>
    );
};
