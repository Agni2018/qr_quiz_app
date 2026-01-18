'use client';

import { useState } from 'react';
import axios from 'axios';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { FaPlus, FaTrash } from 'react-icons/fa';

export default function QuestionForm({ topicId, onQuestionAdded, onCancel }: { topicId: string, onQuestionAdded: () => void, onCancel: () => void }) {
    const [type, setType] = useState('single_choice');
    const [content, setContent] = useState('');
    const [marks, setMarks] = useState(1);
    const [options, setOptions] = useState<string[]>(['', '']); // Initial 2 options
    const [correctAnswer, setCorrectAnswer] = useState('');

    const questionTypes = [
        { value: 'single_choice', label: 'Single Choice' },
        { value: 'true_false', label: 'True / False' },
        { value: 'fill_blank', label: 'Fill in Blank' },
    ];

    const handleAddOption = () => setOptions([...options, '']);
    const handleOptionChange = (index: number, value: string) => {
        const newOpts = [...options];
        newOpts[index] = value;
        setOptions(newOpts);
    };
    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content || !correctAnswer) return alert('Please fill in required fields');

        const payload: any = {
            topicId,
            type,
            content: { text: content }, // Text only for MVP
            marks,
            correctAnswer
        };

        if (type === 'single_choice' || type === 'multi_select') {
            payload.options = options.filter(o => o.trim());
        }

        try {
            await axios.post('http://localhost:5000/api/questions', payload);
            onQuestionAdded();
        } catch (err) {
            console.error(err);
            alert('Failed to add question');
        }
    };

    return (
        <Card style={{ marginTop: '1rem', border: '1px solid var(--primary)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Add New Question</h3>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)' }}
                >
                    {questionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            <Input label="Question Text" value={content} onChange={e => setContent(e.target.value)} />
            <Input label="Marks" type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} style={{ width: '100px' }} />

            {/* Options Logic */}
            {(type === 'single_choice' || type === 'multi_select') && (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Options</label>
                    {options.map((opt, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Input value={opt} onChange={e => handleOptionChange(idx, e.target.value)} placeholder={`Option ${idx + 1}`} style={{ marginBottom: 0 }} />
                            <Button variant="danger" onClick={() => handleRemoveOption(idx)}><FaTrash /></Button>
                        </div>
                    ))}
                    <Button variant="secondary" onClick={handleAddOption} type="button" style={{ fontSize: '0.8rem', padding: '0.5rem' }}><FaPlus /> Add Option</Button>
                </div>
            )}

            <Input
                label="Correct Answer (Exact matches text or option)"
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                placeholder={type === 'single_choice' ? 'e.g. Option Text' : 'Answer'}
            />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button onClick={handleSubmit} style={{ flex: 1 }}>Save Question</Button>
                <Button variant="outline" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button>
            </div>
        </Card>
    );
}
