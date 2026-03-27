'use client';

import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    isMobile?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export default function Pagination({ 
    currentPage, 
    totalItems, 
    itemsPerPage, 
    onPageChange, 
    isMobile = false,
    className = "",
    style = {}
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayRange = totalItems > 0 
        ? `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalItems)} / ${totalItems}`
        : '0-0 / 0';

    return (
        <div 
            className={`flex items-center justify-between bg-white border border-slate-200 rounded-3xl shadow-lg ${className}`}
            style={{ 
                padding: isMobile ? '1rem 1.5rem' : '1.25rem 2rem',
                maxWidth: isMobile ? '300px' : '400px',
                gap: '1rem',
                ...style
            }}
        >
            <div>
                <span className="text-sm font-black text-[#4b5563] uppercase tracking-widest whitespace-nowrap">
                    {displayRange}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                        currentPage === 1 
                            ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                            : 'bg-[#1a1f2e] text-orange-500 hover:bg-orange-500 hover:text-white shadow-sm'
                    }`}
                >
                    Prev
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                        currentPage === totalPages 
                            ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                            : 'bg-[#1a1f2e] text-orange-500 hover:bg-orange-500 hover:text-white shadow-sm'
                    }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
