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
    // Check for existing session in multiple locations
    let savedData: string | null = null;

    // 1. Try localStorage first (preferred)
    savedData = storage.getItem('commander_data');

    // 2. If not found, try sessionStorage (fallback for tracking prevention)
    if (!savedData) {
      try {
        savedData = sessionStorage.getItem('commander_data');
        if (savedData) {
          console.log('Recovered data from sessionStorage');
          // Copy to our storage service for persistence
          storage.setItem('commander_data', savedData);
        }
      } catch (e) {
        console.warn('sessionStorage not available', e);
      }
    }

    // 3. If still not found, check Cookies (fallback for tracking prevention)
    if (!savedData) {
      try {
        const name = "commander_data=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) === 0) {
            savedData = c.substring(name.length, c.length);
            console.log('Recovered data from Cookie');
            // Save to storage for better persistence
            storage.setItem('commander_data', savedData);
            // Clear cookie to avoid stale data
            document.cookie = "commander_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        }
      } catch (e) {
        console.warn('Failed to read cookie', e);
      }
    }

    // 4. If still not found, check URL params (last resort)
    if (!savedData) {
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');
      if (dataParam) {
        try {
          savedData = decodeURIComponent(dataParam);
          console.log('Recovered data from URL params');
          // Save to storage and clean URL
          storage.setItem('commander_data', savedData);
          window.history.replaceState({}, document.title, '/');
        } catch (e) {
          console.error('Failed to parse URL data', e);
        }
      }
    }

    // If we found data anywhere, use it
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setGameData(parsedData);
        setIsAuthenticated(true);
        console.log('Commander data loaded successfully');
      } catch (e) {
        console.error('Failed to parse commander data', e);
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
        {/* Debug Info - Remove in production */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, padding: '10px', fontSize: '10px', color: '#666', background: 'rgba(0,0,0,0.8)', maxWidth: '100%', wordBreak: 'break-all' }}>
          Debug: No session found. Storage checked. URL params: {window.location.search}
        </div>
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