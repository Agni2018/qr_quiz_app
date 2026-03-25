'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { FaGraduationCap, FaDownload, FaTimes } from 'react-icons/fa';
import CertificateTemplate from '@/components/CertificateTemplate';
import Link from 'next/link';

export default function StudentCertificates() {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const res = await api.get('/quiz/my-certificates');
                setCertificates(res.data);
            } catch (err) {
                console.error('Error fetching certificates:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    const handleDownloadCertificate = async () => {
        if (!selectedCertificate) return;

        setIsDownloading(true);
        setTimeout(async () => {
            const element = document.getElementById('certificate-download-area');
            if (!element) {
                console.error('Certificate element not found');
                setIsDownloading(false);
                alert('Could not find certificate preview. Please try again.');
                return;
            }
            await performDownload(element);
        }, 300);
    };

    const performDownload = async (element: HTMLElement) => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1000,
                windowHeight: 750,
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('certificate-download-area');
                    if (clonedElement) {
                        clonedElement.style.display = 'block';
                        clonedElement.style.visibility = 'visible';
                        clonedElement.style.transform = 'none';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Certificate_${selectedCertificate.topicId?.name || 'Quiz'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (certificates.length === 0) {
        return (
            <Card className="p-20 text-center border-dashed border-2 border-white/5 rounded-[40px] mt-12" style={{ background: '#1a1f2e' }}>
                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner shadow-white/5">📜</div>
                <h3 className="text-4xl font-black mb-4">No certificates earned</h3>
                <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">Complete quiz topics with at least one correct answer to earn yours!</p>
                <Link href="/dashboard/student/explore">
                    <Button className="px-16 py-6 rounded-[2rem] text-xl font-black bg-primary shadow-xl shadow-primary/20">Start a Quiz</Button>
                </Link>
            </Card>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {certificates.map((cert) => (
                    <Card
                        key={cert._id}
                        className="border-white/5 hover:bg-slate-900/60 rounded-[2rem] flex flex-col h-full shadow-2xl transition-all group"
                        style={{ padding: '2.5rem', background: '#1a1f2e' }}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="text-indigo-400 text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
                                <FaGraduationCap />
                            </div>
                            <div className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                Verified
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                            <h4 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors leading-tight">{cert.topicId?.name}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{cert.topicId?.description}</p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between" style={{ marginTop: 30 }}>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Earned On</span>
                                <span className="text-xs font-bold text-slate-300">{new Date(cert.certifiedAt).toLocaleDateString()}</span>
                            </div>
                            <Button
                                className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 rounded-xl flex items-center gap-2"
                                onClick={() => {
                                    setSelectedCertificate(cert);
                                    setShowCertificateModal(true);
                                }}
                            >
                                <FaDownload size={10} /> Download
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* CERTIFICATE PREVIEW MODAL */}
            {showCertificateModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in overflow-y-auto py-10 px-4" onClick={() => setShowCertificateModal(false)}>
                    <div className="relative max-w-5xl w-full my-auto flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowCertificateModal(false)}
                            className="absolute -top-14 right-0 p-3 bg-white/10 hover:bg-red-500/20 hover:text-red-500 text-white rounded-2xl transition-all z-[501] sm:-top-16 md:-right-4"
                        >
                            <FaTimes size={20} />
                        </button>

                        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 sm:p-12 min-h-[300px] sm:min-h-[400px] w-full max-md:mb-8 max-md:!p-4 max-md:rounded-[1.5rem]">
                            {/* Fixed size container for capture, scaled visually for preview */}
                            <div className="certificate-preview-wrapper flex items-center justify-center overflow-hidden w-full h-[250px] xs:h-[300px] sm:h-[500px] lg:h-[700px]">
                                <div
                                    id="certificate-download-area"
                                    className="origin-center shadow-inner"
                                    style={{
                                        width: '1000px',
                                        height: '750px',
                                        transform: 'scale(var(--cert-scale, 1))',
                                        flexShrink: 0
                                    }}
                                >
                                    <CertificateTemplate
                                        participantName={selectedCertificate?.user?.name || 'Student'}
                                        topicName={selectedCertificate?.topicId?.name || 'Quiz Topic'}
                                        date={new Date(selectedCertificate?.certifiedAt).toLocaleDateString()}
                                    />
                                </div>
                            </div>

                            <style jsx>{`
                                .certificate-preview-wrapper {
                                    --cert-scale: 0.95;
                                }
                                @media (max-width: 1100px) {
                                    .certificate-preview-wrapper {
                                        --cert-scale: calc(100vw / 1150);
                                    }
                                }
                                @media (max-width: 640px) {
                                    .certificate-preview-wrapper {
                                        --cert-scale: calc(100vw / 1100);
                                    }
                                }
                                @media (max-width: 480px) {
                                    .certificate-preview-wrapper {
                                        --cert-scale: calc(100vw / 1200);
                                    }
                                }
                            `}</style>
                        </div>

                        <div className="mt-12 sm:mt-10 flex justify-center w-full px-4 sm:px-0 max-md:!mt-8 max-md:pb-6">
                            <Button
                                onClick={handleDownloadCertificate}
                                disabled={isDownloading}
                                className="px-12 py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/40 flex items-center gap-4 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center !m-0 max-md:!w-full max-md:!py-4"
                            >
                                {isDownloading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <FaDownload /> Download Official PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
