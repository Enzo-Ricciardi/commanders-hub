
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface FullscreenContextType {
  setFullscreenContent: (content: ReactNode | null) => void;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

export const FullscreenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fullscreenContent, setFullscreenContent] = useState<ReactNode | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreenContent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const value = {
    setFullscreenContent,
  };

  return (
    <FullscreenContext.Provider value={value}>
      {children}
      {fullscreenContent && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8 animate-fade-in"
          onClick={() => setFullscreenContent(null)}
          role="dialog"
          aria-modal="true"
        >
          {fullscreenContent}
        </div>
      )}
    </FullscreenContext.Provider>
  );
};

export const useFullscreen = (): FullscreenContextType => {
  const context = useContext(FullscreenContext);
  if (context === undefined) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
};

// Add fade-in animation to index.css if it's not there
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);
