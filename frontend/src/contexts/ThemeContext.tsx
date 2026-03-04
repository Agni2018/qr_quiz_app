'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'purple' | 'emerald';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('emerald');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('quiz-theme') as string;
        if (savedTheme && ['dark', 'purple', 'emerald'].includes(savedTheme)) {
            setThemeState(savedTheme as Theme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (savedTheme === 'light') {
            setThemeState('emerald');
            document.documentElement.setAttribute('data-theme', 'emerald');
            localStorage.setItem('quiz-theme', 'emerald');
        } else {
            document.documentElement.setAttribute('data-theme', 'emerald');
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('quiz-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme, mounted]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    return context || { theme: 'dark' as Theme, setTheme: () => { } };
}
