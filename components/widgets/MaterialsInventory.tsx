
import React, { useState } from 'react';
import { DataCard } from '../DataCard';
import { Material } from '../../types';
import { MaterialsIcon } from '../icons';
import { useLanguage } from '../../context/LanguageContext';

interface MaterialsInventoryProps {
  materials: Material[];
}

const MaterialProgressBar: React.FC<{value: number, max: number}> = ({ value, max }) => {
    const percentage = (value / max) * 100;
    const color = percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500';
    return (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className={`${color} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};


export const MaterialsInventory: React.FC<MaterialsInventoryProps> = ({ materials }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'Raw' | 'Manufactured' | 'Encoded'>('Raw');

  const filteredMaterials = materials.filter(m => m.category === activeTab);

  const TabButton: React.FC<{label: string, category: 'Raw' | 'Manufactured' | 'Encoded'}> = ({ label, category }) => (
    <button
        onClick={() => setActiveTab(category)}
        className={`px-4 py-1 text-sm rounded-md transition ${activeTab === category ? 'bg-orange-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
    >
        {t(label)}
    </button>
  )

  return (
    <DataCard title="materialsInventoryTitle" icon={<MaterialsIcon />} className="h-[26rem]">
      <div className="flex flex-col h-full">
        <div className="flex justify-center gap-2 mb-3">
            <TabButton label="matCatRaw" category="Raw" />
            <TabButton label="matCatManufactured" category="Manufactured" />
            <TabButton label="matCatEncoded" category="Encoded" />
        </div>
        <div className="flex-grow overflow-y-auto space-y-2 pr-2">
            {filteredMaterials.map(mat => (
                <div key={mat.name} className="text-sm">
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-300">{mat.name}</span>
                        <span className="font-mono text-white">{mat.count} / {mat.max}</span>
                    </div>
                    <MaterialProgressBar value={mat.count} max={mat.max} />
                </div>
            ))}
        </div>
      </div>
    </DataCard>
  );
};
