'use client';

import { useState, useRef } from 'react';

import Card from './Card';
import Button from './Button';
import Input from './Input';
import { FaTimes, FaCloudUploadAlt, FaFile, FaVideo, FaTrash } from 'react-icons/fa';
import api from '@/lib/api';
import TextArea from './TextArea';


interface UploadMaterialModalProps {
    topicId: string;
    topicName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadMaterialModal({ topicId, topicName, onClose, onSuccess }: UploadMaterialModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            // Default name to filename if not set
            if (!name) {
                const baseName = selectedFile.name.split('.').slice(0, -1).join('.');
                setName(baseName);
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !name.trim()) {
            setError('Please select a file and provide a name.');
            return;
        }

        setUploading(true);
        setError('');

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        try {
            let cloudUrl = '';

            // 1. If Cloudinary is configured, upload there first (bypasses Vercel 4.5MB limit)
            if (cloudName && uploadPreset) {
                const cloudData = new FormData();
                cloudData.append('file', file);
                cloudData.append('upload_preset', uploadPreset);
                cloudData.append('resource_type', 'auto'); // Crucial for PDF/Video support

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                    { method: 'POST', body: cloudData }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'Cloudinary upload failed');
                }

                const result = await response.json();
                cloudUrl = result.secure_url;
            }

            // 2. Notify our backend (sending either the cloudUrl or the direct file)
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('topicId', topicId);

            if (cloudUrl) {
                formData.append('cloudUrl', cloudUrl);
            } else {
                formData.append('file', file);
            }

            await api.post('/study-materials/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || err.response?.data?.message || 'Failed to upload material.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] backdrop-blur-xl flex items-center justify-center p-6 bg-black/80" onClick={onClose} style={{ padding: '1.5rem' }}>
            <Card className="w-full max-w-lg p-0 rounded-[2.5rem] overflow-hidden shadow-3xl border border-white/10" style={{ background: '#0a0e1a', margin: '1rem' }} onClick={e => e.stopPropagation()}>
                <div className="border-b border-white/5 flex justify-between items-center bg-[#060910]" style={{ padding: '2.5rem 3rem' }}>
                    <div>
                        <h3 className="text-2xl font-black text-white">Upload Materials</h3>
                        <p className="text-primary font-bold text-xs mt-1 uppercase tracking-[0.2em]">Adding to: {topicName}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all text-slate-400">
                        <FaTimes size={18} />
                    </button>
                </div>

                <div className="flex flex-col gap-10" style={{ padding: '3rem' }}>
                    {/* File Dropzone */}
                    {!file ? (
                        <label
                            htmlFor="file-upload-input"
                            className="border-2 border-dashed border-white/10 rounded-[2rem] p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group bg-white/5"
                            style={{ padding: '3rem' }}
                        >
                            <input
                                id="file-upload-input"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <FaCloudUploadAlt className="text-5xl text-slate-600 group-hover:text-primary mb-4 transition-all duration-500 group-hover:scale-110" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Click to select file</p>
                            <p className="text-slate-600 text-[10px] mt-2 uppercase tracking-[0.2em] font-black">PDF, Images, Video, DOCX</p>
                        </label>
                    ) : (

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all" style={{ padding: '1.5rem' }}>
                            <div className="flex items-center gap-4" style={{ padding: '0' }}>
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl border border-primary/20">
                                    {file.type.startsWith('video/') ? <FaVideo /> : <FaFile />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-white truncate max-w-[200px] uppercase tracking-tight">{file.name}</span>
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-3 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                <FaTrash size={16} />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-8" style={{ padding: '0' }}>
                        <Input
                            label="Display Name"
                            placeholder="Enter material title..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-primary transition-all rounded-2xl h-14 font-bold"
                            style={{ margin: '0' }}
                        />
                        <div className="w-full text-left" style={{ margin: '0' }}>
                            <label className="block mb-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Description</label>
                            <textarea
                                placeholder="What's in this material?"
                                style={{
                                    padding: '1.25rem 1.75rem',
                                    borderRadius: '1.25rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '0.875rem',
                                    minHeight: '120px',
                                    margin: '0'
                                }}
                                className="w-full text-white outline-none focus:border-primary transition-all resize-none font-medium placeholder:text-slate-600"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20" style={{ padding: '1rem', margin: '0' }}>{error}</p>}

                    <div className="flex flex-col sm:flex-row gap-4" style={{ padding: '0' }}>
                        <Button
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-hover shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                            onClick={handleUpload}
                            disabled={uploading || !file}
                            style={{ margin: '0' }}
                        >
                            {uploading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Uploading...
                                </div>
                            ) : 'Upload Material'}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-black uppercase tracking-widest text-xs transition-all border border-white/5"
                            onClick={onClose}
                            style={{ margin: '0' }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
