import React from 'react';
import { DataCard } from '../../../components/DataCard';

export const ExplorationPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-3xl font-bold text-white mb-6">Exploration</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataCard title="Expedition Log" icon={<span>🧭</span>}>
                    <div className="p-4 text-gray-400 text-center">
                        Flight log synchronization coming soon (EDSM).
                    </div>
                </DataCard>

                <DataCard title="Neutron Plotter" icon={<span>✨</span>}>
                    <div className="p-4 text-gray-400 text-center">
                        Neutron star route plotter coming soon.
                    </div>
                </DataCard>
            </div>
        </div>
    );
};
