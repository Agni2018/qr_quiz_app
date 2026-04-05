'use client';

import React, { useState } from 'react';
import ActiveChallengesList from '@/components/ActiveChallengesList';
import ChallengeManagement from '@/components/ChallengeManagement';
import Button from '@/components/Button';
import { FaPlus, FaTimes } from 'react-icons/fa';
import BadgeChallengeHeader from '@/components/BadgeChallengeHeader';

export default function AdminChallengesPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleChallengeCreated = () => {
        setRefreshKey(k => k + 1);
        setModalOpen(false);
    };

    return (
        <div className="animate-fade-in mb-24">
            <BadgeChallengeHeader type="admin" activeTab="challenges" />
            
            {/* Page Header */}
            <div
                className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6"
                style={{ paddingLeft: '20px', paddingRight: '20px', marginBottom: '24px', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}
            >
                <div className="flex flex-col gap-1">
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter" style={{color:'black'}}>System Challenges</h3>
                </div>

                <Button
                    onClick={() => setModalOpen(true)}
                    className="h-14 px-8 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    style={{ background: '#4f46e5' }}
                >
                    <FaPlus className="mr-2" /> Create Challenge
                </Button>
            </div>

            {/* Active Challenges List */}
            <div style={{ paddingLeft: '20px', paddingRight: '20px', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}>
                <ActiveChallengesList refreshKey={refreshKey} />
            </div>

            {/* Create Challenge Modal */}
            {modalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.55)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '1.5rem 0',
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
                >
                    <div
                        style={{
                            marginInline: '1rem',
                            width: '100%',
                            maxWidth: '900px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            background: 'white',
                            borderRadius: '2rem',
                            position: 'relative',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
                        }}
                    >
                        {/* Close Button — sticky so it stays visible while scrolling */}
                        <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', padding: '1rem 1rem 0', background: 'white' }}>
                            <button
                                onClick={() => setModalOpen(false)}
                                style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    fontSize: '1rem',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#fde8d8')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
                                title="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal title */}
                        <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: '#4f46e5' }}>
                                Challenge <span className="text-indigo-600">Creator</span>
                            </h2>
                            <p className="text-slate-500 font-medium mt-1" style={{ color: '#4f46e5' }}>
                                Define the parameters of elite achievement.
                            </p>
                        </div>

                        <ChallengeManagement onSuccess={handleChallengeCreated} />
                    </div>
                </div>
            )}
        </div>
    );
}
