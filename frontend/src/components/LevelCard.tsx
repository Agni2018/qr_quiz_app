'use client';

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaStar, FaCheckCircle } from 'react-icons/fa';

interface LevelCardProps {
    points: number;
}

export default function LevelCard({ points }: LevelCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const levels = Array.from({ length: 11 }, (_, i) => ({
        level: i + 1,
        minPoints: i * 50
    }));

    const currentLevel = Math.min(Math.floor(points / 50) + 1, 11);
    const nextLevel = currentLevel < 11 ? currentLevel + 1 : null;
    const pointsInCurrentLevel = points % 50;
    const progress = currentLevel === 11 ? 100 : (pointsInCurrentLevel / 50) * 100;

    return (
        <div className="relative">
            {/* Main Card */}
            <div 
                className="bg-slate-900/60 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl shadow-lg cursor-pointer hover:bg-slate-800/60 transition-all select-none group"
                style={{ padding: '10px 15px' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <FaStar className="animate-pulse" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-wider">Level</span>
                    <span className="text-xl font-black text-white flex items-center gap-2">
                        {currentLevel}
                        {isOpen ? <FaChevronUp className="text-[0.7rem] text-slate-500" /> : <FaChevronDown className="text-[0.7rem] text-slate-500" />}
                    </span>
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-4 w-72 bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-fade-in backdrop-blur-2xl">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h4 className="text-white font-black text-lg">Level {currentLevel}</h4>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                {currentLevel === 11 ? 'Max level reached!' : `${50 - pointsInCurrentLevel} pts to Level ${nextLevel}`}
                            </p>
                        </div>
                        <span className="text-2xl font-black text-blue-500">{Math.round(progress)}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Levels List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {levels.map((l) => (
                            <div 
                                key={l.level}
                                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                                    l.level === currentLevel 
                                    ? 'bg-blue-500/10 border border-blue-500/20' 
                                    : l.level < currentLevel 
                                    ? 'opacity-60' 
                                    : 'hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {l.level <= currentLevel ? (
                                        <FaCheckCircle className="text-blue-500 text-sm" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-700" />
                                    )}
                                    <span className={`text-sm font-bold ${l.level === currentLevel ? 'text-white' : 'text-slate-400'}`}>
                                        Level {l.level}
                                    </span>
                                </div>
                                <span className="text-[0.7rem] font-bold text-slate-500">
                                    {l.minPoints} PTS
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
