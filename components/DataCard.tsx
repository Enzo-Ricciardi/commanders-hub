
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFullscreen } from '../context/FullscreenContext';
import { ExpandIcon, CollapseIcon } from './icons';

interface DataCardProps {
  title: string;
  icon: React.ReactElement;
  children: React.ReactNode;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({ title, icon, children, className = '' }) => {
  const { t } = useLanguage();
  const { setFullscreenContent } = useFullscreen();

  const handleExpand = () => {
    setFullscreenContent(
        <div className="w-full h-full max-w-7xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="glassmorphism rounded-lg p-4 flex flex-col h-full relative">
                <div className="flex items-center mb-3 border-b border-orange-400/20 pb-2">
                    <div className="text-orange-400 mr-3">{icon}</div>
                    <h2 className="font-orbitron text-lg text-gray-200 uppercase tracking-wider">{t(title)}</h2>
                </div>
                <button 
                  onClick={() => setFullscreenContent(null)} 
                  className="absolute top-3 right-3 text-gray-400 hover:text-white p-2"
                  aria-label="Close fullscreen"
                >
                    <CollapseIcon />
                </button>
                <div className="flex-grow overflow-y-auto pr-2">
                    {children}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className={`glassmorphism rounded-lg p-4 flex flex-col ${className}`}>
      <div className="flex items-center mb-3 border-b border-orange-400/20 pb-2">
        <div className="text-orange-400 mr-3">{icon}</div>
        <h2 className="font-orbitron text-lg text-gray-200 uppercase tracking-wider flex-grow">{t(title)}</h2>
        <button onClick={handleExpand} className="text-gray-500 hover:text-orange-400 transition-colors" aria-label={`Expand ${t(title)}`}>
            <ExpandIcon />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {children}
      </div>
    </div>
  );
};