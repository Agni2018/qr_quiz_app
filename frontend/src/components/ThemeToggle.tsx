'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { FaSun, FaMoon, FaPalette, FaGem } from 'react-icons/fa';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="theme-toggle-container">

            <button
                onClick={() => setTheme('dark')}
                className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                title="Dark Mode"
                aria-label="Switch to dark mode"
            >
                <FaMoon />
            </button>
            <button
                onClick={() => setTheme('purple')}
                className={`theme-toggle-btn ${theme === 'purple' ? 'active' : ''}`}
                title="Modern Dark"
                aria-label="Switch to modern dark mode"
            >
                <FaPalette />
            </button>
            <button
                onClick={() => setTheme('emerald')}
                className={`theme-toggle-btn ${theme === 'emerald' ? 'active' : ''}`}
                title="Emerald Prestige"
                aria-label="Switch to emerald prestige theme"
            >
                <FaGem className={theme === 'emerald' ? 'text-[#fbc02d]' : ''} />
            </button>
        </div>
    );
}
