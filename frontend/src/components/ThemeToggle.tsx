'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { FaSun, FaMoon, FaPalette } from 'react-icons/fa';

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
                <FaPalette className="text-[#10b981]" />
            </button>
        </div>
    );
}
