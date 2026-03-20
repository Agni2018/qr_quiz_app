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
        <div className="fixed inset-0 z-[110] backdrop-blur-md flex items-center justify-center px-4" style={{ background: 'rgba(0, 0, 0, 0.7)' }}>
            <Card className="w-full max-w-lg p-0 rounded-[2.5rem] overflow-hidden shadow-2xl" style={{ background: 'var(--background)', borderColor: 'var(--border-color)' }} onClick={e => e.stopPropagation()}>
                <div className="border-b border-white/5 flex justify-between items-center bg-slate-900/40" style={{ padding: '3rem 4rem' }}>
                    <div>
                        <h3 className="text-2xl font-black">Upload Materials</h3>
                        <p className="text-slate-500 font-medium">Adding to: {topicName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <FaTimes />
                    </button>
                </div>

                <div className="flex flex-col gap-10" style={{ padding: '4rem' }}>
                    {/* File Dropzone */}
                    {!file ? (
                        <label
                            htmlFor="file-upload-input"
                            className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        >
                            <input
                                id="file-upload-input"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <FaCloudUploadAlt className="text-5xl text-slate-600 group-hover:text-primary mb-4 transition-colors" />
                            <p className="text-slate-400 font-bold">Click to select file</p>
                            <p className="text-slate-600 text-xs mt-2 uppercase tracking-widest font-black">PDF, Images, Video, DOCX</p>
                        </label>
                    ) : (

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl">
                                    {file.type.startsWith('video/') ? <FaVideo /> : <FaFile />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                <FaTrash />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-8">
                        <Input
                            label="Display Name"
                            placeholder="Enter material title..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <div className="w-full">
                            <label className="block mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                            <textarea
                                placeholder="What's in this material?"
                                style={{
                                    padding: '1.25rem 1.75rem',
                                    borderRadius: '1.25rem',
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '1rem',
                                    minHeight: '140px'
                                }}
                                className="w-full text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 p-4 rounded-xl">{error}</p>}

                    <div className="flex gap-4">
                        <Button
                            className="flex-1 h-14 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black text-lg"
                            onClick={handleUpload}
                            disabled={uploading || !file}
                        >
                            {uploading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Uploading...
                                </div>
                            ) : 'Upload Material'}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl border-white/10 text-slate-400 font-bold"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
