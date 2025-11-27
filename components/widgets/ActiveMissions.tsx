
import React from 'react';
import { DataCard } from '../DataCard';
import { Mission } from '../../types';
import { MissionLogIcon } from '../icons';
import { useLanguage } from '../../context/LanguageContext';

interface ActiveMissionsProps {
  missions: Mission[];
}

export const ActiveMissions: React.FC<ActiveMissionsProps> = ({ missions }) => {
  const { t } = useLanguage();

  return (
    <DataCard title="activeMissionsTitle" icon={<MissionLogIcon />} className="h-[26rem]">
      <div className="space-y-3">
        {missions.length > 0 ? missions.map(mission => (
          <div key={mission.id} className="p-2 bg-gray-900/50 rounded-md border border-gray-700/50 text-sm">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-orange-400">{mission.type} {mission.isWing && '(Wing)'}</p>
              <p className="text-green-400 font-mono">+{mission.reward.toLocaleString()} CR</p>
            </div>
            <p className="text-gray-300">To: <span className="text-white">{mission.destinationSystem}</span></p>
            <p className="text-gray-400">For: {mission.faction}</p>
          </div>
        )) : (
          <p className="text-gray-500 text-center pt-8">{t('noActiveMissions')}</p>
        )}
      </div>
    </DataCard>
  );
};
