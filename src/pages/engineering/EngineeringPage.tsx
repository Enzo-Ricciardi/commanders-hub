import React from 'react';
import { DataCard } from '../../../components/DataCard';

export const EngineeringPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-3xl font-bold text-white mb-6">Engineering</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataCard title="Material Inventory" icon={<span>🔩</span>}>
                    <div className="p-4 text-gray-400 text-center">
                        Material inventory sync coming soon (Inara).
                    </div>
                </DataCard>

                <DataCard title="Blueprints" icon={<span>📝</span>}>
                    <div className="p-4 text-gray-400 text-center">
                        Engineering blueprints wishlist coming soon.
                    </div>
                </DataCard>
            </div>
        </div>
    );
};
