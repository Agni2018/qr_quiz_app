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
    const [options, setOptions] = useState<string[]>(['', '']); // For single_choice, multi_select
    const [correctAnswer, setCorrectAnswer] = useState<any>(''); // Can be string or array
    const [matchPairs, setMatchPairs] = useState<Array<{ left: string, right: string }>>([
        { left: '', right: '' },
        { left: '', right: '' }
    ]); // For match type

    const questionTypes = [
        { value: 'single_choice', label: 'Single Choice' },
        { value: 'multi_select', label: 'Multiple Choice (Multi-Select)' },
        { value: 'true_false', label: 'True / False' },
        { value: 'fill_blank', label: 'Fill in Blank' },
        { value: 'match', label: 'Match the Following' },
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

    const handleAddMatchPair = () => setMatchPairs([...matchPairs, { left: '', right: '' }]);
    const handleMatchPairChange = (index: number, side: 'left' | 'right', value: string) => {
        const newPairs = [...matchPairs];
        newPairs[index][side] = value;
        setMatchPairs(newPairs);
    };
    const handleRemoveMatchPair = (index: number) => {
        setMatchPairs(matchPairs.filter((_, i) => i !== index));
    };

    // Handle checkbox selection for single_choice
    const handleSingleChoiceSelect = (option: string) => {
        setCorrectAnswer(option);
    };

    // Handle checkbox selection for multi_select
    const handleMultiSelectToggle = (option: string) => {
        const currentAnswers = Array.isArray(correctAnswer) ? correctAnswer : [];
        if (currentAnswers.includes(option)) {
            setCorrectAnswer(currentAnswers.filter(ans => ans !== option));
        } else {
            setCorrectAnswer([...currentAnswers, option]);
        }
    };

    // Reset form when type changes
    const handleTypeChange = (newType: string) => {
        setType(newType);
        setCorrectAnswer('');
        if (newType === 'true_false') {
            setOptions(['True', 'False']);
        } else if (newType === 'single_choice' || newType === 'multi_select') {
            setOptions(['', '']);
        }
    };

    const handleSubmit = async () => {
        if (!content) return alert('Please enter the question text');

        // Validation based on type
        if (type === 'fill_blank' && !correctAnswer) {
            return alert('Please enter the correct answer');
        }
        if ((type === 'single_choice' || type === 'true_false') && !correctAnswer) {
            return alert('Please select the correct answer');
        }
        if (type === 'multi_select' && (!Array.isArray(correctAnswer) || correctAnswer.length === 0)) {
            return alert('Please select at least one correct answer');
        }
        if (type === 'match') {
            const validPairs = matchPairs.filter(p => p.left.trim() && p.right.trim());
            if (validPairs.length < 2) {
                return alert('Please add at least 2 complete match pairs');
            }
        }

        const payload: any = {
            topicId,
            type,
            content: { text: content },
            marks
        };

        if (type === 'single_choice' || type === 'multi_select') {
            payload.options = options.filter(o => o.trim());
            payload.correctAnswer = correctAnswer;
        } else if (type === 'true_false') {
            payload.options = ['True', 'False'];
            payload.correctAnswer = correctAnswer;
        } else if (type === 'fill_blank') {
            payload.correctAnswer = correctAnswer;
        } else if (type === 'match') {
            const validPairs = matchPairs.filter(p => p.left.trim() && p.right.trim());
            payload.options = validPairs;
            // For match type, correct answer is the same as options (the correct pairs)
            payload.correctAnswer = validPairs;
        }

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/questions`, payload);
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
                    onChange={(e) => handleTypeChange(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)' }}
                >
                    {questionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            <Input label="Question Text" value={content} onChange={e => setContent(e.target.value)} />
            <Input label="Marks" type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} style={{ width: '100px' }} />

            {/* Options for single_choice and multi_select */}
            {(type === 'single_choice' || type === 'multi_select') && (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Options</label>
                    {options.map((opt, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <Input value={opt} onChange={e => handleOptionChange(idx, e.target.value)} placeholder={`Option ${idx + 1}`} style={{ marginBottom: 0, flex: 1 }} />
                            <Button variant="danger" onClick={() => handleRemoveOption(idx)} style={{ padding: '0.75rem' }}><FaTrash /></Button>
                        </div>
                    ))}
                    <Button variant="secondary" onClick={handleAddOption} type="button" style={{ fontSize: '0.8rem', padding: '0.5rem' }}><FaPlus /> Add Option</Button>
                </div>
            )}

            {/* Match the Following pairs */}
            {type === 'match' && (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Match Pairs</label>
                    {matchPairs.map((pair, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Input
                                value={pair.left}
                                onChange={e => handleMatchPairChange(idx, 'left', e.target.value)}
                                placeholder={`Left ${idx + 1}`}
                                style={{ marginBottom: 0, flex: 1 }}
                            />
                            <span style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>↔</span>
                            <Input
                                value={pair.right}
                                onChange={e => handleMatchPairChange(idx, 'right', e.target.value)}
                                placeholder={`Right ${idx + 1}`}
                                style={{ marginBottom: 0, flex: 1 }}
                            />
                            <Button variant="danger" onClick={() => handleRemoveMatchPair(idx)} style={{ padding: '0.75rem' }}><FaTrash /></Button>
                        </div>
                    ))}
                    <Button variant="secondary" onClick={handleAddMatchPair} type="button" style={{ fontSize: '0.8rem', padding: '0.5rem' }}><FaPlus /> Add Pair</Button>
                </div>
            )}

            {/* Correct Answer Section */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Correct Answer</label>

                {/* Fill in the blank - text input */}
                {type === 'fill_blank' && (
                    <Input
                        value={correctAnswer}
                        onChange={e => setCorrectAnswer(e.target.value)}
                        placeholder="Enter the correct answer"
                    />
                )}

                {/* True/False - radio buttons */}
                {type === 'true_false' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {['True', 'False'].map(option => (
                            <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="trueFalse"
                                    checked={correctAnswer === option}
                                    onChange={() => handleSingleChoiceSelect(option)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                )}

                {/* Single Choice - radio buttons */}
                {type === 'single_choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {options.filter(o => o.trim()).length === 0 ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                Please add options above first
                            </p>
                        ) : (
                            options.filter(o => o.trim()).map((option, idx) => (
                                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="singleChoice"
                                        checked={correctAnswer === option}
                                        onChange={() => handleSingleChoiceSelect(option)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))
                        )}
                    </div>
                )}

                {/* Multi Select - checkboxes */}
                {type === 'multi_select' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {options.filter(o => o.trim()).length === 0 ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                Please add options above first
                            </p>
                        ) : (
                            options.filter(o => o.trim()).map((option, idx) => (
                                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={Array.isArray(correctAnswer) && correctAnswer.includes(option)}
                                        onChange={() => handleMultiSelectToggle(option)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))
                        )}
                    </div>
                )}

                {/* Match - auto-populated from pairs */}
                {type === 'match' && (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        Correct matches are automatically set from the pairs you created above.
                    </p>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button onClick={handleSubmit} style={{ flex: 1 }}>Save Question</Button>
                <Button variant="outline" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button>
            </div>
        </Card>
    );
}
