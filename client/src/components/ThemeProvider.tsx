import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'auto' 
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Détection du thème système
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Résolution du thème
  useEffect(() => {
    let newResolvedTheme: 'light' | 'dark';
    
    if (theme === 'auto') {
      newResolvedTheme = getSystemTheme();
    } else {
      newResolvedTheme = theme;
    }
    
    setResolvedTheme(newResolvedTheme);
    
    // Application du thème au DOM
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newResolvedTheme);
    
    // Sauvegarde dans localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Écoute des changements de thème système
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setResolvedTheme(getSystemTheme());
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Chargement du thème depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(current => {
      switch (current) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'auto';
        case 'auto':
          return 'light';
        default:
          return 'light';
      }
    });
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook pour les couleurs adaptatives
export const useAdaptiveColors = () => {
  const { resolvedTheme } = useTheme();
  
  const colors = {
    light: {
      background: 'bg-gray-50',
      surface: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      accent: 'text-blue-600',
    },
    dark: {
      background: 'bg-gray-900',
      surface: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      border: 'border-gray-700',
      accent: 'text-blue-400',
    }
  };
  
  return colors[resolvedTheme];
};

// Composant de toggle du thème
export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🔄';
      default:
        return '☀️';
    }
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={`Thème: ${theme}`}
    >
      <span className="text-lg">{getThemeIcon()}</span>
    </button>
  );
};
