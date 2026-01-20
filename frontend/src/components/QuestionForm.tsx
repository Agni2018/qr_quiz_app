'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { FaPlus, FaTrash } from 'react-icons/fa';

export default function QuestionForm({
    topicId,
    onQuestionAdded,
    onCancel
}: {
    topicId: string;
    onQuestionAdded: () => void;
    onCancel: () => void;
}) {
    const [type, setType] = useState('single_choice');
    const [content, setContent] = useState('');
    const [marks, setMarks] = useState(1);
    const [options, setOptions] = useState<string[]>(['', '']);
    const [correctAnswer, setCorrectAnswer] = useState<any>('');
    const [matchPairs, setMatchPairs] = useState<Array<{ left: string; right: string }>>([
        { left: '', right: '' },
        { left: '', right: '' }
    ]);

    const questionTypes = [
        { value: 'single_choice', label: 'Single Choice' },
        { value: 'multi_select', label: 'Multiple Choice (Multi-Select)' },
        { value: 'true_false', label: 'True / False' },
        { value: 'fill_blank', label: 'Fill in the Blank' },
        { value: 'match', label: 'Match the Following' }
    ];

    const handleAddOption = () => setOptions([...options, '']);

    const handleOptionChange = (index: number, value: string) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleAddMatchPair = () => {
        setMatchPairs([...matchPairs, { left: '', right: '' }]);
    };

    const handleMatchPairChange = (
        index: number,
        side: 'left' | 'right',
        value: string
    ) => {
        const updated = [...matchPairs];
        updated[index][side] = value;
        setMatchPairs(updated);
    };

    const handleRemoveMatchPair = (index: number) => {
        setMatchPairs(matchPairs.filter((_, i) => i !== index));
    };

    const handleSingleChoiceSelect = (option: string) => {
        setCorrectAnswer(option);
    };

    const handleMultiSelectToggle = (option: string) => {
        const current = Array.isArray(correctAnswer) ? correctAnswer : [];
        setCorrectAnswer(
            current.includes(option)
                ? current.filter(a => a !== option)
                : [...current, option]
        );
    };

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
        if (!content.trim()) return alert('Please enter the question text');

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
            payload.correctAnswer = validPairs;
        }

        try {
            await api.post('/questions', payload);
            onQuestionAdded();
        } catch (error) {
            console.error(error);
            alert('Failed to add question');
        }
    };

    return (
        <Card
            className="p-10 rounded-[32px] border border-white/10 bg-[#1e293b] shadow-2xl overflow-hidden relative"
        >
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-2xl">
                        📝
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Add New Question</h3>
                        <p className="text-slate-400 text-sm font-medium">Create a new challenge for your participants</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Question Type */}
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">
                            Question Type
                        </label>
                        <select
                            value={type}
                            onChange={e => handleTypeChange(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-black/20 border-2 border-white/5 text-slate-200 focus:border-violet-500/50 transition-all outline-none appearance-none cursor-pointer"
                        >
                            {questionTypes.map(t => (
                                <option key={t.value} value={t.value} className="bg-[#1e293b]">
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">
                            Difficulty/Marks
                        </label>
                        <Input
                            type="number"
                            value={marks}
                            onChange={e => setMarks(Number(e.target.value))}
                            className="!mb-0"
                            placeholder="Points"
                        />
                    </div>
                </div>

                <div className="mb-10">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1 mb-3 block">
                        Question Content
                    </label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Write your question here..."
                        className="w-full p-6 rounded-2xl bg-black/20 border-2 border-white/5 text-slate-200 focus:border-violet-500/50 transition-all outline-none min-h-[120px] resize-none"
                    />
                </div>

                {/* Options Section */}
                {(type === 'single_choice' || type === 'multi_select') && (
                    <div className="mb-10 p-8 rounded-[24px] bg-black/10 border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">
                                Answer Options
                            </label>
                            <Button
                                variant="secondary"
                                onClick={handleAddOption}
                                type="button"
                                className="py-2 px-4 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500 hover:text-white"
                            >
                                <FaPlus className="mr-2" /> Add Choice
                            </Button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {options.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className="flex gap-4 items-center group"
                                >
                                    <div className="flex-1 relative">
                                        <Input
                                            value={opt}
                                            onChange={e => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Choice ${idx + 1}`}
                                            className="!mb-0 !p-4"
                                        />
                                    </div>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRemoveOption(idx)}
                                        className="p-4 rounded-xl opacity-40 group-hover:opacity-100 transition-opacity bg-red-500/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white"
                                    >
                                        <FaTrash size={14} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Match Pairs Section */}
                {type === 'match' && (
                    <div className="mb-10 p-8 rounded-[24px] bg-black/10 border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">
                                Matching Pairs
                            </label>
                            <Button
                                variant="secondary"
                                onClick={handleAddMatchPair}
                                type="button"
                                className="py-2 px-4 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500 hover:text-white"
                            >
                                <FaPlus className="mr-2" /> Add Pair
                            </Button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {matchPairs.map((pair, idx) => (
                                <div
                                    key={idx}
                                    className="flex gap-4 items-center group"
                                >
                                    <Input
                                        value={pair.left}
                                        onChange={e => handleMatchPairChange(idx, 'left', e.target.value)}
                                        placeholder="Term"
                                        className="!mb-0 flex-1"
                                    />
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <span className="text-slate-500 text-sm">↔</span>
                                    </div>
                                    <Input
                                        value={pair.right}
                                        onChange={e => handleMatchPairChange(idx, 'right', e.target.value)}
                                        placeholder="Definition"
                                        className="!mb-0 flex-1"
                                    />
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRemoveMatchPair(idx)}
                                        className="p-4 rounded-xl opacity-40 group-hover:opacity-100 transition-opacity bg-red-500/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white"
                                    >
                                        <FaTrash size={14} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Correct Answer Section */}
                <div className="mb-12 p-8 rounded-[24px] bg-violet-500/5 border border-violet-500/10 shadow-inner">
                    <label className="text-xs font-black uppercase tracking-widest text-violet-400/70 px-1 mb-5 block">
                        Set Correct Answer
                    </label>

                    <div className="px-2">
                        {type === 'fill_blank' && (
                            <Input
                                value={correctAnswer}
                                onChange={e => setCorrectAnswer(e.target.value)}
                                placeholder="Enter the exact correct answer"
                                className="!p-5 bg-black/40 border-violet-500/20"
                            />
                        )}

                        {type === 'true_false' && (
                            <div className="flex gap-6">
                                {['True', 'False'].map(option => (
                                    <button
                                        key={option}
                                        onClick={() => handleSingleChoiceSelect(option)}
                                        className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${correctAnswer === option
                                            ? 'bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/30'
                                            : 'bg-black/20 border-white/5 text-slate-400 hover:border-violet-500/30'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}

                        {(type === 'single_choice' || type === 'multi_select') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {options.filter(o => o.trim()).map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() =>
                                            type === 'single_choice'
                                                ? handleSingleChoiceSelect(option)
                                                : handleMultiSelectToggle(option)
                                        }
                                        className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 text-left ${(type === 'single_choice' && correctAnswer === option) ||
                                            (type === 'multi_select' && Array.isArray(correctAnswer) && correctAnswer.includes(option))
                                            ? 'bg-violet-500/20 border-violet-500 text-white'
                                            : 'bg-black/20 border-white/5 text-slate-400 hover:border-violet-500/20'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${(type === 'single_choice' && correctAnswer === option) ||
                                            (type === 'multi_select' && Array.isArray(correctAnswer) && correctAnswer.includes(option))
                                            ? 'border-white bg-white'
                                            : 'border-slate-600'
                                            }`}>
                                            {((type === 'single_choice' && correctAnswer === option) ||
                                                (type === 'multi_select' && Array.isArray(correctAnswer) && correctAnswer.includes(option))) && (
                                                    <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                                                )}
                                        </div>
                                        <span className="font-medium truncate">{option}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {type === 'match' && (
                            <div className="flex items-center gap-3 text-violet-400/60 bg-violet-500/5 p-4 rounded-xl border border-violet-500/10">
                                <span className="text-xl">ℹ️</span>
                                <p className="text-xs font-bold uppercase tracking-wider">
                                    Correct pairs are mapped automatically.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col md:flex-row gap-4 pt-6 mt-6 border-t border-white/5">
                    <Button onClick={handleSubmit} className="flex-[2] py-5 rounded-[20px] text-lg font-black shadow-xl shadow-violet-500/20">
                        ✨ Save Question
                    </Button>
                    <Button variant="outline" onClick={onCancel} className="flex-1 py-5 rounded-[20px] border-white/10 text-slate-400 hover:bg-white/5 font-bold">
                        Discard
                    </Button>
                </div>
            </div>
        </Card>
    );
}

