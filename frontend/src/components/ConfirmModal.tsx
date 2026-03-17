'use client';

import { FaTimes, FaQuestionCircle } from 'react-icons/fa';
import Card from './Card';
import Button from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] backdrop-blur-sm flex items-center justify-center px-4" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
            <Card className="w-full max-w-md p-0 rounded-[2rem] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200" style={{ background: 'var(--background)', padding:30,margin:'1rem 2rem 2rem 2rem', borderColor: 'var(--border-color)' }} onClick={e => e.stopPropagation()} >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10">
                    <FaTimes />
                </button>
                <div className="flex flex-col items-center text-center p-8">
                    <FaQuestionCircle className={`text-5xl mb-4 ${isDanger ? 'text-red-500' : 'text-primary'}`} style={{marginBottom:30}} />
                    <h3 className="text-2xl font-black mb-2">{title}</h3>
                    <p className="text-slate-400 font-medium mb-8" style={{marginBottom:30}}>
                        {message}
                    </p>
                    <div className="flex gap-4 w-full">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl border-white/10 text-slate-400 font-bold hover:bg-white/5"
                            onClick={onClose}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-xl font-bold text-lg"
                            style={isDanger ? {
                                background: 'var(--error)',
                                boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)'
                            } : {}}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
