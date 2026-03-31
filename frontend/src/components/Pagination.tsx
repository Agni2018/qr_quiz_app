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
            className={`flex items-center gap-12 bg-white rounded-full ${className}`}
            style={{ 
                padding: '0.75rem 2.5rem',
                border: '1px solid #f1f5f9',
                boxShadow: '0 5px 20px rgba(0,0,0,0.02)',
                ...style
            }}
        >
            <div className="shrink-0">
                <span className="text-[13px] font-bold tracking-tight" style={{ color: '#1e293b' }}>
                    {displayRange}
                </span>
            </div>

            <div className="flex items-center gap-8 shrink-0">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-[11px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 cursor-pointer"
                    style={{ 
                        color: currentPage === 1 ? '#cbd5e1' : '#94a3b8',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Prev
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-[11px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 cursor-pointer"
                    style={{ 
                        color: currentPage === totalPages ? '#cbd5e1' : '#94a3b8',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                >
                    Next
                </button>
            </div>

        </div>
    );
}

