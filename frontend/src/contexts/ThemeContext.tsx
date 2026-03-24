'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'emerald';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('quiz-theme') as string;
        
        // MIGRATION: If they had 'emerald' (the old default) or 'purple'/'light', 
        // we move them to 'dark' (the new default) once.
        const migrated = localStorage.getItem('theme-migrated-v2');
        
        if (!migrated) {
            setThemeState('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('quiz-theme', 'dark');
            localStorage.setItem('theme-migrated-v2', 'true');
        } else if (savedTheme && ['dark', 'emerald'].includes(savedTheme)) {
            setThemeState(savedTheme as Theme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            setThemeState('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('quiz-theme', 'dark');
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
