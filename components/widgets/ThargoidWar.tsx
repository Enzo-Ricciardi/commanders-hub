import React from 'react';
import { DataCard } from '../DataCard';
import { useLanguage } from '../../context/LanguageContext';
import { ThargoidSystem } from '../../types';

interface ThargoidWarProps {
    systems: ThargoidSystem[];
}

export const ThargoidWar: React.FC<ThargoidWarProps> = ({ systems }) => {
    const { t } = useLanguage();

    return (
        <DataCard title="thargoidWarTitle" icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        }>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {systems && systems.length > 0 ? (
                    systems.map((system, index) => (
                        <div key={index} className="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                            <div className="flex justify-between items-center mb-1">
                                <div>
                                    <span className="font-bold text-red-100">{system.name}</span>
                                    {system.distance !== null && system.distance !== undefined && (
                                        <span className="ml-2 text-xs text-orange-400">({system.distance} ly)</span>
                                    )}
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white">{system.status}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="bg-red-600 h-2.5 rounded-full"
                                    style={{ width: `${(system.progress || 0) * 100}%` }}
                                ></div>
                            </div>
                            <div className="text-right text-xs text-red-300 mt-1">
                                {Math.round((system.progress || 0) * 100)}% {t('thargoidProgress')}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 py-4">
                        {t('noThargoidActivity')}
                    </div>
                )}
            </div>
        </DataCard>
    );
};
