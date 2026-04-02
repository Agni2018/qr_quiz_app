'use client';

import React, { useState } from 'react';
import ActiveChallengesList from '@/components/ActiveChallengesList';
import ChallengeManagement from '@/components/ChallengeManagement';
import Button from '@/components/Button';
import { FaPlus, FaTimes } from 'react-icons/fa';

export default function AdminChallengesPage() {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="animate-fade-in mb-24">
            {/* Page Header */}
            <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
                style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '48px', marginBottom: '40px', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}
            >
                <div className="flex flex-col gap-2">
                    <h2
                        className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none"
                        style={{ color: 'black' }}
                    >
                        Active <span className="text-orange-600" style={{color:'black'}}>Challenges</span>
                    </h2>
                    <p className="text-slate-500 font-medium text-lg max-w-xl mt-2" style={{ color: 'black' }}>
                        Define the parameters of elite achievement. Architect your prestige through tactical weekly objectives.
                    </p>
                </div>

                <div className="w-full md:w-auto flex justify-end">
                    <Button
                        onClick={() => setModalOpen(true)}
                        className="h-14 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black transition-all shadow-[0_10px_30px_rgba(249,115,22,0.2)] group flex items-center gap-3"
                    >
                        <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-xs tracking-widest uppercase">Create Challenge</span>
                    </Button>
                </div>
            </div>

            {/* Active Challenges List */}
            <div style={{ paddingLeft: '20px', paddingRight: '20px', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}>
                <ActiveChallengesList />
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
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: 'orange' }}>
                                Challenge <span className="text-orange-600">Creator</span>
                            </h2>
                            <p className="text-slate-500 font-medium mt-1" style={{ color: 'orange' }}>
                                Define the parameters of elite achievement.
                            </p>
                        </div>

                        <ChallengeManagement />
                    </div>
                </div>
            )}
        </div>
    );
}
