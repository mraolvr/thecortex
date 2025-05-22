import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('auto');
  const [accentColor, setAccentColor] = useState('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    const savedAccentColor = localStorage.getItem('accentColor') || 'blue';
    setTheme(savedTheme);
    setAccentColor(savedAccentColor);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setAutoTheme = () => {
    setTheme('auto');
  };

  const changeAccentColor = (color) => {
    setAccentColor(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, accentColor, toggleTheme, setAutoTheme, changeAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 