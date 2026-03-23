'use client';

import { useTheme, Theme } from '@/contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';
import { FaSun, FaMoon, FaPalette, FaGem, FaChevronDown, FaChevronUp, FaCheckCircle } from 'react-icons/fa';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const themes: { id: Theme; label: string; icon: any; color: string }[] = [
        { id: 'dark', label: 'Dark Mode', icon: FaMoon, color: '#10b981' },
        { id: 'purple', label: 'Modern Dark', icon: FaPalette, color: '#10b981' },
        { id: 'emerald', label: 'Emerald Prestige', icon: FaGem, color: '#fbc02d' }
    ];

    const currentTheme = themes.find(t => t.id === theme) || themes[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef} >
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-slate-900/60 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-xl shadow-lg hover:bg-slate-800/60 transition-all select-none group min-w-[180px]"
                style={{padding:"15px"}}
                aria-label="Toggle theme menu"
            >
                <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${currentTheme.color}15`, color: currentTheme.color }}
                >
                    <currentTheme.icon size={14} />
                </div>
                <div className="flex flex-col items-start leading-none flex-1">
                    <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-wider">Theme</span>
                    <span className="text-sm font-black text-white">
                        {currentTheme.label}
                    </span>
                </div>
                {isOpen ? <FaChevronUp className="text-[0.7rem] text-slate-500" /> : <FaChevronDown className="text-[0.7rem] text-slate-500" />}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-slate-950 border border-white/10 rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-fade-in backdrop-blur-2xl">
                    <div className="flex flex-col gap-1">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                    theme === t.id 
                                    ? 'bg-white/10 border border-white/10' 
                                    : 'hover:bg-white/5 border border-transparent'
                                } group/item`}
                            >
                                <div className="flex items-center gap-3">
                                    <div 
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                            theme === t.id ? '' : 'bg-white/5 text-slate-500 group-hover/item:text-white'
                                        }`}
                                        style={theme === t.id ? { background: `${t.color}20`, color: t.color } : {}}
                                    >
                                        <t.icon size={14} />
                                    </div>
                                    <span className={`text-sm font-bold ${theme === t.id ? 'text-white' : 'text-slate-400 group-hover/item:text-white'}`}>
                                        {t.label}
                                    </span>
                                </div>
                                {theme === t.id && (
                                    <FaCheckCircle className="text-primary text-xs" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
