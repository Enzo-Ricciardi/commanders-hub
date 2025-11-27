import React, { useState } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { GameData } from '../types';
import { loginAndFetchData } from '../services/apiService';

interface LoginScreenProps {
  onLogin: (data: GameData) => void;
}

const languages: { code: Language, name: string, flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

// =======================================================================================
// ACTION REQUIRED: UPDATE THIS URL AFTER YOUR FIRST DEPLOYMENT
// =======================================================================================
// After running `firebase deploy --only functions`, copy the full URL for the 
// 'frontierAuth' function from the terminal output and paste it here.
// Use the rewrite rule to point to the function
const FRONTIER_AUTH_URL = "/frontierAuth";

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const storedData = localStorage.getItem('commander_data');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        onLogin(data);
        localStorage.removeItem('commander_data'); // Clean up
      } catch (e) {
        console.error("Failed to parse stored game data", e);
      }
    }
  }, [onLogin]);

  const handleMockLogin = async () => {
    setIsLoading(true);
    const data = await loginAndFetchData();
    onLogin(data);
    // No need to set isLoading(false) as the component will unmount
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed filter grayscale blur-sm"
        style={{ backgroundImage: "url('https://www.elitedangerous.com/static/images/backgrounds/media-bg-odyssey-3.jpg')" }}
      ></div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md glassmorphism rounded-lg shadow-2xl p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-orbitron text-orange-500 tracking-widest uppercase mb-2">
            {t('appTitle')}
          </h1>
          <p className="text-sm text-gray-400 mb-8">{t('appSubtitle')}</p>

          <div className="mb-8">
            <label className="block text-gray-300 text-lg mb-4">{t('selectLanguage')}</label>
            <div className="flex justify-center items-center gap-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`text-3xl p-2 rounded-md transition-all duration-300 ${language === lang.code ? 'bg-orange-500/30 scale-125' : 'opacity-60 hover:opacity-100 hover:scale-110'}`}
                  title={lang.name}
                >
                  {lang.flag}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-gray-300 mb-4">
              {t('loginDescription')}
            </p>
            <a
              href={FRONTIER_AUTH_URL}
              className="block w-full text-center bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-md transition duration-300"
            >
              {t('loginFrontier')}
            </a>
            <p className="text-gray-500 text-xs mt-2 mb-6">
              {t('loginRedirectNotice')}
            </p>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-800/80 px-2 text-sm text-gray-400 rounded-md">{t('orSeparator')}</span>
              </div>
            </div>

            <button onClick={handleMockLogin} disabled={isLoading} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
              {isLoading ? t('loggingIn') : t('useDemoData')}
            </button>
            <p className="text-gray-500 text-xs mt-2">
              {t('demoDataDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};