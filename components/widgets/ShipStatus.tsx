
import React, { useState } from 'react';
import { DataCard } from '../DataCard';
import { Ship } from '../../types';
import { ShipIcon, SparkleIcon } from '../icons';
import { analyzeWithAI } from '../../services/geminiService';
import { useLanguage } from '../../context/LanguageContext';

interface ShipStatusProps {
  ship: Ship;
}

const ProgressBar: React.FC<{value: number, max: number, color: string}> = ({ value, max, color }) => {
    const percentage = (value / max) * 100;
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

export const ShipStatus: React.FC<ShipStatusProps> = ({ ship }) => {
    const { t } = useLanguage();
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSuggestUpgrades = async () => {
        setIsLoading(true);
        setSuggestion('');
        const prompt = `Based on this Elite Dangerous ship loadout for a ${ship.type}, suggest some effective engineering upgrades or module swaps to improve its performance for deep space exploration and asteroid mining. Here is the current loadout: ${JSON.stringify(ship.modules)}. Keep the response concise and in bullet points.`;
        const result = await analyzeWithAI(prompt, false);
        setSuggestion(result);
        setIsLoading(false);
    };

    return (
        <DataCard title="shipStatusTitle" icon={<ShipIcon />} className="h-[26rem]">
            <div className="space-y-3">
                <h3 className="text-xl font-bold text-white">{ship.name} <span className="text-base font-light text-gray-400">({ship.type})</span></h3>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div><span className="text-gray-400">{t('hullLabel')}:</span> {ship.integrity}%</div>
                    <div><span className="text-gray-400">{t('shieldsLabel')}:</span> {ship.shields}%</div>
                    <div><span className="text-gray-400">{t('armorLabel')}:</span> {ship.armor}%</div>
                    <div><span className="text-gray-400">{t('jumpRangeLabel')}:</span> {ship.jumpRange.current.toFixed(2)} Ly</div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{t('fuelLabel')}</span><span>{ship.fuel.current}/{ship.fuel.capacity}T</span></div>
                    <ProgressBar value={ship.fuel.current} max={ship.fuel.capacity} color="bg-blue-500" />
                </div>
                
                <div className="text-sm"><span className="text-gray-400">{t('cargoLabel')}:</span> {ship.cargo.current}/{ship.cargo.capacity}T</div>
                <div className="text-sm"><span className="text-gray-400">{t('rebuyLabel')}:</span> <span className="text-red-400">{ship.rebuyCost.toLocaleString()} CR</span></div>
                
                <div className="pt-2">
                    <button onClick={handleSuggestUpgrades} disabled={isLoading} className="w-full flex items-center justify-center bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500">
                        <SparkleIcon />
                        <span className="ml-2">{isLoading ? t('analyzingButton') : t('aiSuggestButton')}</span>
                    </button>
                    {suggestion && (
                        <div className="mt-3 p-3 bg-gray-900/50 rounded-md border border-gray-700 text-sm">
                           <p className="font-semibold mb-2 text-orange-400">{t('covasSuggestionsTitle')}:</p>
                           <div className="whitespace-pre-wrap text-gray-300">{suggestion}</div>
                        </div>
                    )}
                </div>
            </div>
        </DataCard>
    );
};
