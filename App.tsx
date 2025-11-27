
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { Chatbot } from './components/Chatbot';
import { LoginScreen } from './components/LoginScreen';
import { GameData } from './types';

const App: React.FC = () => {
  const [gameData, setGameData] = useState<GameData | null>(null);

  const handleLogin = (data: GameData) => {
    setGameData(data);
  };

  if (!gameData) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed filter grayscale blur-sm"
        style={{ backgroundImage: "url('https://hosting.zaonce.net/elite-dangerous/website/asset-bank/images/wallpapers/wallpapers-2560x1440/Screenshot_514.jpg')" }}
      ></div>
      <div className="relative z-10 min-h-screen bg-black bg-opacity-60">
        <Header commander={gameData.commander} />
        <main className="p-4 lg:p-8">
          <Dashboard gameData={gameData} />
        </main>

      </div>
    </div>
  );
};

export default App;