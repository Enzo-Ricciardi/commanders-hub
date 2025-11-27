
import React from 'react';
import { DataCard } from '../DataCard';
import { Commander } from '../../types';
import { UserIcon } from '../icons';
import { useLanguage } from '../../context/LanguageContext';

interface CommanderProfileProps {
  commander: Commander;
}

const RankItem: React.FC<{label: string, value: string}> = ({ label, value }) => {
    const { t } = useLanguage();
    return (
        <div className="flex justify-between items-center text-sm py-1.5 border-b border-gray-700/50">
            <span className="text-gray-400">{t(label)}</span>
            <span className="font-semibold text-orange-400">{value}</span>
        </div>
    );
};

const ReputationBar: React.FC<{label: string, value: number}> = ({ label, value }) => (
    <div>
        <div className="flex justify-between text-xs mb-1 text-gray-400">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${value}%` }}></div>
        </div>
    </div>
);


export const CommanderProfile: React.FC<CommanderProfileProps> = ({ commander }) => {
  const { t } = useLanguage();
  return (
    <DataCard title="commanderStatusTitle" icon={<UserIcon />} className="h-[26rem]">
      <div className="space-y-2 text-gray-300">
        <h3 className="text-xl font-bold text-white">{commander.name}</h3>
        <p className="text-sm"><span className="text-gray-400">{t('creditsLabel')}:</span> <span className="text-green-400 font-mono">{commander.credits.toLocaleString()} CR</span></p>
        <p className="text-sm"><span className="text-gray-400">{t('locationLabel')}:</span> {commander.location}</p>
        <p className="text-sm"><span className="text-gray-400">{t('powerLabel')}:</span> {commander.power}</p>

        <div className="pt-2">
            <h4 className="font-semibold text-gray-200 mb-2">{t('reputationLabel')}</h4>
            <div className="space-y-2">
                <ReputationBar label="Federation" value={commander.reputation.federation} />
                <ReputationBar label="Empire" value={commander.reputation.empire} />
                <ReputationBar label="Alliance" value={commander.reputation.alliance} />
            </div>
        </div>

        <div className="pt-2">
            <h4 className="font-semibold text-gray-200 mb-1">{t('ranksLabel')}</h4>
            <RankItem label="rankCombat" value={commander.ranks.combat} />
            <RankItem label="rankTrade" value={commander.ranks.trade} />
            <RankItem label="rankExploration" value={commander.ranks.exploration} />
            <RankItem label="rankCQC" value={commander.ranks.cqc} />
        </div>
      </div>
    </DataCard>
  );
};
