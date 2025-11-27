import React, { useState, useEffect } from 'react';
import { DataCard } from '../DataCard';
import { LogIcon } from '../icons';
import { useLanguage } from '../../context/LanguageContext';
import { GameData } from '../../types';

interface ExplorationLogProps {
  gameData: GameData;
}

export const ExplorationLog: React.FC<ExplorationLogProps> = ({ gameData }) => {
  const { t } = useLanguage();
  const [note, setNote] = useState('');
  const [savedLogs, setSavedLogs] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('captain_logs');
    if (saved) {
      setSavedLogs(JSON.parse(saved));
    }
  }, []);

  const handleSaveLog = () => {
    if (!note.trim()) return;

    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      system: gameData.system.name,
      location: gameData.commander.location,
      note: note
    };

    const updatedLogs = [newLog, ...savedLogs];
    setSavedLogs(updatedLogs);
    localStorage.setItem('captain_logs', JSON.stringify(updatedLogs));
    setNote('');
  };

  return (
    <DataCard title="explorationLogTitle" icon={<LogIcon />} className="h-[26rem]">
      <div className="flex flex-col h-full">
        <div className="mb-4 space-y-2">
          <div className="text-xs text-gray-400 flex justify-between">
            <span>{t('currentSystem')}: <span className="text-orange-400">{gameData.system.name}</span></span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('logPlaceholder')}
            className="w-full bg-gray-900/50 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:border-orange-500 transition resize-none h-24"
          />
          <button
            onClick={handleSaveLog}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-1.5 rounded text-sm transition-colors"
          >
            {t('saveLogEntry')}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar border-t border-gray-700 pt-2">
          <h4 className="text-xs text-gray-400 uppercase mb-2">{t('previousEntries')}</h4>
          <div className="space-y-3">
            {savedLogs.map(log => (
              <div key={log.id} className="bg-gray-800/30 p-2 rounded border border-gray-700/50">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>{log.date}</span>
                  <span className="text-orange-400/80">{log.system}</span>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{log.note}</p>
              </div>
            ))}
            {savedLogs.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4 italic">
                {t('noLogEntries')}
              </div>
            )}
          </div>
        </div>
      </div>
    </DataCard>
  );
};
