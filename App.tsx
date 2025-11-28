import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { MainLayout } from './src/components/layout/MainLayout';
import { TradingPage } from './src/pages/trading/TradingPage';
import { ExplorationPage } from './src/pages/exploration/ExplorationPage';
import { EngineeringPage } from './src/pages/engineering/EngineeringPage';
import { CommunityPage } from './src/pages/community/CommunityPage';
import { GameData } from './types';
import { fetchGameData } from './services/mockApiService';
import { FullscreenProvider } from './context/FullscreenContext';
import { LanguageProvider } from './context/LanguageContext';
import { loginAndFetchData } from './services/apiService';
import { storage } from './services/storageService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedData = storage.getItem('commander_data');
    if (savedData) {
      try {
        setGameData(JSON.parse(savedData));
        setIsAuthenticated(true);
      } catch (e) {
        storage.removeItem('commander_data');
      }
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this would trigger the OAuth flow
      // For now, we simulate a login or use the mock data if backend fails
      try {
        // Try to fetch real data (which might redirect)
        // If we are already redirected back with data in localStorage, the useEffect above handles it.
        // If this is a fresh login click:
        window.location.href = 'https://us-central1-gen-lang-client-0452273955.cloudfunctions.net/frontierAuth';
      } catch (err) {
        console.warn("Backend auth failed, falling back to mock data", err);
        // Fallback to mock data for demo purposes
        const data = await fetchGameData();
        setGameData(data);
        setIsAuthenticated(true);
        storage.setItem('commander_data', JSON.stringify(data));
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.removeItem('commander_data');
    setIsAuthenticated(false);
    setGameData(null);
  };

  if (!isAuthenticated) {
    return (
      <LanguageProvider>
        <LoginScreen onLogin={handleLogin} loading={loading} error={error} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <FullscreenProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={gameData ? <Dashboard gameData={gameData} /> : <div>Loading...</div>} />
              <Route path="trading" element={<TradingPage />} />
              <Route path="exploration" element={<ExplorationPage />} />
              <Route path="engineering" element={<EngineeringPage />} />
              <Route path="community" element={<CommunityPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FullscreenProvider>
    </LanguageProvider>
  );
};

export default App;