
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Commander } from '../types';

interface HeaderProps {
    commander: Commander;
}

export const Header: React.FC<HeaderProps> = ({ commander }) => {
  const { t } = useLanguage();
  return (
    <header className="p-4 bg-black bg-opacity-30 border-b border-orange-500/30 text-center">
      <h1 className="text-2xl md:text-4xl font-orbitron text-orange-500 tracking-widest uppercase">
        {t('appTitle')}
      </h1>
      <p className="text-sm text-gray-400 mb-2">{t('appSubtitle')}</p>
      <p className="text-md text-orange-300">{t('welcomeMessage')}, {commander.name}</p>
    </header>
  );
};
