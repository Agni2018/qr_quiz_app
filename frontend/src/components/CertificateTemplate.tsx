'use client';

import React from 'react';
import { FaGraduationCap, FaCertificate } from 'react-icons/fa';

interface CertificateTemplateProps {
    participantName: string;
    topicName: string;
    date: string;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
    participantName,
    topicName,
    date
}) => {
    return (
        <div
            id="certificate-download-area"
            className="certificate-container relative overflow-hidden"
            style={{
                width: '1000px',
                height: '750px',
                border: '20px solid #000000',
                fontFamily: "'Playfair Display', serif",
                backgroundColor: '#ffffff',
                color: '#000000',
                boxSizing: 'border-box',
                padding: '48px' /* Explicit p-12 equivalent */
            }}
        >
            {/* Background Decorations - Subtle */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -translate-x-12 -translate-y-12" style={{ backgroundColor: '#f1f5f9' }}></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl translate-x-12 translate-y-12" style={{ backgroundColor: '#f1f5f9' }}></div>

            {/* Inner Borders */}
            <div className="absolute inset-6 border-4 pointer-events-none" style={{ borderColor: 'rgba(0,0,0,0.15)' }}></div>
            <div className="absolute inset-10 border-2 pointer-events-none" style={{ borderColor: 'rgba(0,0,0,0.08)' }}></div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col items-center justify-between py-12">

                {/* Logo / Badge */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
                        <FaGraduationCap />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.5em]" style={{ color: '#000000' }}>Academic Excellence</span>
                </div>

                {/* Main Heading */}
                <div className="text-center">
                    <h1 className="text-7xl font-black mb-1 uppercase tracking-tighter" style={{ color: '#000000' }}>
                        Certificate
                    </h1>
                    <h2 className="text-3xl font-black italic" style={{ color: '#000000' }}>
                        of Completion
                    </h2>
                </div>

                {/* Body Text */}
                <div className="text-center flex flex-col gap-6">
                    <p className="text-2xl font-black" style={{ color: '#000000' }}>This is to certify that</p>
                    <div className="mb-2">
                        <h3 className="text-6xl font-black underline underline-offset-8 decoration-black" style={{ color: '#000000' }}>
                            {participantName}
                        </h3>
                    </div>
                    <p className="text-2xl px-12 leading-relaxed font-black" style={{ color: '#000000' }}>
                        has successfully completed the assessment for the topic
                        <br />
                        <span className="font-black text-4xl uppercase tracking-tight mt-2 block" style={{ color: '#000000' }}>
                            "{topicName}"
                        </span>
                    </p>
                </div>

                {/* Footer Area - Increased padding bottom to avoid clipping */}
                <div className="w-full flex justify-between items-end px-20 pb-12">
                    {/* Left: Date */}
                    <div className="flex flex-col items-center">
                        <div className="w-40 h-[3px] mb-2" style={{ backgroundColor: '#000000' }}></div>
                        <span className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#000000' }}>Date Issued</span>
                        <span className="text-base font-black" style={{ color: '#000000' }}>{date}</span>
                    </div>

                    {/* Center: Seal */}
                    <div className="relative mb-4">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderColor: 'rgba(0,0,0,0.1)' }}>
                            <FaCertificate size={48} style={{ color: 'rgba(0,0,0,0.2)' }} />
                        </div>
                        <span className="text-2xl font-black italic" style={{ color: 'rgba(0,0,0,0.3)' }}>QR Quiz Pro</span>
                    </div>

                    {/* Right: Signature & Verification */}
                    <div className="flex flex-col items-center">
                        <div className="z-20" style={{ paddingBottom: '24px' }}>
                            <span className="text-4xl font-serif italic" style={{ fontFamily: "'Dancing Script', cursive", color: 'rgba(0,0,0,0.9)' }}>
                                Admin. QR
                            </span>
                        </div>
                        <div className="w-40 h-[3px] mb-2" style={{ backgroundColor: '#000000' }}></div>
                        <span className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#000000' }}>Verified By</span>
                        <span className="text-base font-black uppercase" style={{ color: '#000000' }}>QR Quiz Platform</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
                
                .certificate-container {
                    box-sizing: border-box;
                    background-color: #ffffff !important;
                    background-image: 
                        radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0);
                    background-size: 32px 32px;
                }
            `}</style>
        </div>
    );
};

export default CertificateTemplate;
