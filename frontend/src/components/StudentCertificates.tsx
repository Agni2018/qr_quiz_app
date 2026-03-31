'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import { FaGraduationCap, FaDownload, FaTimes, FaMedal } from 'react-icons/fa';
import CertificateTemplate from '@/components/CertificateTemplate';
import Link from 'next/link';
import { useSearch } from '@/contexts/SearchContext';

export default function StudentCertificates() {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { searchTerm } = useSearch();
    const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;

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
            <Card className="p-20 text-center border-dashed border-2 border-slate-200 rounded-[40px] mt-12" style={{ background: 'white', padding:30, margin: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
                <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner border border-slate-100">📜</div>
                <h3 className="text-4xl font-black mb-4" style={{ color: '#000' }}>No certificates earned</h3>
                <p className="mb-12 text-xl max-w-md mx-auto leading-relaxed" style={{ color: '#444' }}>Complete quiz topics with at least one correct answer to earn yours!</p>
                <Link href="/dashboard/student/explore">
                    <Button className="px-16 py-6  rounded-[2rem] text-xl font-black bg-primary shadow-xl shadow-primary/20" style={{marginTop:20}}>Start a Quiz</Button>
                </Link>
            </Card>
        );
    }

    // Filtering
    const filteredCertificates = certificates.filter(cert => 
        cert.topicId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cert.topicId?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedCertificates = filteredCertificates.slice(indexOfFirst, indexOfLast);

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {paginatedCertificates.map((cert) => (
                    <Card
                        key={cert._id}
                        className="border-slate-200 hover:bg-slate-50 rounded-[2.5rem] flex flex-col h-full transition-all group"
                        style={{ padding: '2.5rem', background: 'white', margin: '1.25rem 1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1.5px 6px rgba(0,0,0,0.06)' }}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="text-indigo-500 text-3xl opacity-60 group-hover:opacity-100 transition-opacity">
                                <FaGraduationCap />
                            </div>
                            <div className="bg-indigo-500/10 text-indigo-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                Verified
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                            <h4 className="text-xl font-black group-hover:text-indigo-500 transition-colors leading-tight" style={{ color: '#000' }}>{cert.topicId?.name}</h4>
                            <p className="text-sm leading-relaxed line-clamp-2 font-medium" style={{ color: '#444' }}>{cert.topicId?.description}</p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between" style={{ marginTop: 30 }}>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#666' }}>Earned On</span>
                                <span className="text-xs font-bold" style={{ color: '#333' }}>{new Date(cert.certifiedAt).toLocaleDateString()}</span>
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

            {/* Pagination */}
            {filteredCertificates.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: isMobile ? '1.5rem 1rem 2rem' : '1.5rem 1.5rem 2.5rem',marginTop:20 }}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredCertificates.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        isMobile={isMobile}
                    />
                </div>
            )}

            {filteredCertificates.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4" style={{ color: '#555' }}>
                    <p className="font-bold text-xl">No certificates found matching "{searchTerm}"</p>
                </div>
            )}

            {/* CONTINUE YOUR JOURNEY */}
            <Card
                className="flex flex-col sm:flex-row items-center sm:items-center justify-between border-slate-200 rounded-[2.5rem] transition-all"
                style={{ margin: '50px 1rem', padding: 30, background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1.5px 6px rgba(0,0,0,0.06)' }}
            >
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-2xl bg-[#d1fae5] text-[#059669] flex items-center justify-center flex-shrink-0 shadow-inner">
                        <FaMedal size={28} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-2xl font-black" style={{ color: '#000' }}>Continue your journey</h3>
                        <p className="text-base font-medium" style={{ color: '#444' }}>You have obtained {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}.</p>
                    </div>
                </div>
                <div className="mt-6 sm:mt-0 flex-shrink-0 w-full sm:w-auto">
                    <Link href="/dashboard/student/explore">
                        <Button className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-[#34d399] hover:bg-[#10b981] text-slate-900 transition-colors shadow-lg shadow-[#34d399]/20 flex items-center justify-center">
                            Browse Topics
                        </Button>
                    </Link>
                </div>
            </Card>

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
        </div>
    );
}
