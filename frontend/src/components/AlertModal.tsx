'use client';

import { FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Card from './Card';
import Button from './Button';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-5xl text-green-500 mb-4" />;
            case 'error':
                return <FaExclamationCircle className="text-5xl text-red-500 mb-4" />;
            default:
                return <FaExclamationCircle className="text-5xl text-blue-500 mb-4" />;
        }
    };

    const defaultTitle = {
        success: 'Success',
        error: 'Error',
        info: 'Information'
    }[type];

    return (
        <div className="fixed inset-0 z-[500] backdrop-blur-sm flex items-center justify-center px-4" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
            <Card className="w-full max-w-sm p-0 rounded-[2rem] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200" style={{ background: 'var(--background)',padding:30,margin:'1rem 2rem 2rem 2rem', borderColor: 'var(--border-color)' }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10 cursor-pointer">
                    <FaTimes />
                </button>
                <div className="flex flex-col items-center text-center p-8">
                    {getIcon()}
                    <h3 className="text-2xl font-black mb-2" style={{marginTop:10,marginBottom:10}}>{title || defaultTitle}</h3>
                    <p className="text-slate-400 font-medium mb-8">
                        {message}
                    </p>
                    <Button
                        className="w-full h-12 rounded-xl font-bold text-lg"
                        style={{
                            background: type === 'error' ? 'var(--error)' : type === 'success' ? '#10b981' : 'var(--primary)',
                            boxShadow: `0 4px 14px 0 ${type === 'error' ? 'rgba(239, 68, 68, 0.39)' : type === 'success' ? 'rgba(16, 185, 129, 0.39)' : 'var(--shadow-color)'}`,
                            marginTop:20
                        }}
                        onClick={onClose}
                    >
                        OK
                    </Button>
                </div>
            </Card>
        </div>
    );
}
