'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Button from './Button';
import Input from './Input';
import TextArea from './TextArea';
import Card from './Card';
import { FaPlus, FaTrash, FaUniversity } from 'react-icons/fa';
import QuestionBankModal from './QuestionBankModal';

export default function QuestionForm({
    topicId,
    onQuestionAdded,
    onCancel
}: {
    topicId?: string;
    onQuestionAdded: () => void;
    onCancel: () => void;
}) {
    const [type, setType] = useState('single_choice');
    const [content, setContent] = useState('');
    const [marks, setMarks] = useState(1);
    const [isReusable, setIsReusable] = useState(!topicId);
    const [options, setOptions] = useState<string[]>(['', '']);
    const [correctAnswer, setCorrectAnswer] = useState<any>('');
    const [matchPairs, setMatchPairs] = useState<Array<{ left: string; right: string }>>([
        { left: '', right: '' },
        { left: '', right: '' }
    ]);
    const [showBankModal, setShowBankModal] = useState(false);

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

    const handleImportQuestion = (q: any) => {
        setType(q.type);
        setContent(q.content?.text || '');
        setMarks(q.marks || 1);
        setIsReusable(false);

        if (q.type === 'match') {
            setMatchPairs(q.options || []);
        } else {
            setOptions(q.options || ['', '']);
        }

        setCorrectAnswer(q.correctAnswer);
        setShowBankModal(false);
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
            topicId: topicId || null,
            type,
            content: { text: content },
            marks,
            isReusable
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
        <Card className="p-8 md:p-12 rounded-[32px] border border-white/10 bg-[#1e293b] shadow-2xl overflow-hidden relative">

            {showBankModal && (
                <QuestionBankModal
                    onSelect={handleImportQuestion}
                    onClose={() => setShowBankModal(false)}
                />
            )}

            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="relative z-10 flex flex-col gap-14">

                {!topicId && (
                    <div className="flex items-center gap-6 px-4 py-8 bg-violet-500/10 rounded-[32px] border border-violet-500/20 mb-2">
                        <div className="w-16 h-16 rounded-full bg-violet-400 flex items-center justify-center text-3xl text-white shadow-xl shadow-violet-500/30">
                            <FaUniversity />
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-white tracking-tight">Reusable Question Library</h4>
                            <p className="text-violet-400/80 font-bold uppercase tracking-widest text-xs mt-1">Creating a Global Bank Resource</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-8 px-2">
                    <h5 className="text-2xl font-black text-white border-l-8 border-violet-500 pl-6 mb-4 uppercase tracking-[0.2em]">Questions Details</h5>
                    <div className={`grid grid-cols-1 ${topicId ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 md:gap-12`}>
                        <div className="flex flex-col gap-4">
                            <label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 px-1">
                                Question Type
                            </label>
                            <select
                                value={type}
                                onChange={e => handleTypeChange(e.target.value)}
                                className="w-full h-[64px] p-4 px-8 rounded-2xl bg-black/30 border-2 border-white/5 text-slate-200 focus:border-violet-500/50 transition-all outline-none appearance-none cursor-pointer shadow-inner font-bold"
                            >
                                {questionTypes.map(t => (
                                    <option key={t.value} value={t.value} className="bg-[#1e293b]">
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-4">
                            <label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 px-1">
                                Difficulty / Marks
                            </label>
                            <Input
                                type="number"
                                value={marks}
                                onChange={e => setMarks(Number(e.target.value))}
                                containerClassName="!mb-0"
                                className="!p-4 !px-8 !rounded-2xl !border-2 !border-white/5 bg-black/30 focus:!border-violet-500/50 h-[64px] shadow-inner !font-bold"
                                placeholder="Points"
                            />
                        </div>

                        {topicId && (
                            <div className="flex flex-col gap-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 px-1">
                                    Library Access
                                </label>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowBankModal(true)}
                                    className="w-full h-[64px] !p-0 bg-violet-500/10 text-violet-400 border-2 border-violet-500/20 hover:bg-violet-500 hover:text-white rounded-2xl flex items-center justify-center transition-all group font-black uppercase tracking-widest text-xs"
                                >
                                    <FaUniversity className="mr-3 group-hover:scale-110 transition-transform text-lg" /> Question Bank
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* QUESTION CONTENT */}
                <div className="flex flex-col gap-8 px-2">
                    <h5 className="text-2xl font-black text-white border-l-8 border-violet-500 pl-6 mb-4 uppercase tracking-[0.2em]">Question Content</h5>
                    <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 px-1">
                            Main Content
                        </label>
                        <TextArea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Write your question here..."
                            className="!p-8 !px-10 !rounded-3xl bg-black/30 border-2 border-white/5 !min-h-[180px]"
                        />
                    </div>
                </div>

                {/* OPTIONS */}
                {(type === 'single_choice' || type === 'multi_select') && (
                    <div className="flex flex-col gap-6 px-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                            Answer Options
                        </label>

                        <div className="p-6 md:p-10 rounded-[32px] bg-black/10 border border-white/5 flex flex-col gap-8">

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-2">Define Choices</span>
                                <Button
                                    variant="secondary"
                                    onClick={handleAddOption}
                                    type="button"
                                    className="py-3 px-6 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500 hover:text-white rounded-xl"
                                >
                                    <FaPlus className="mr-2" /> Add Choice
                                </Button>
                            </div>

                            <div className="flex flex-col gap-5">
                                {options.map((opt, idx) => (
                                    <div key={idx} className="flex gap-4 items-center group">
                                        <div className="flex-1 relative">
                                            <Input
                                                value={opt}
                                                onChange={e => handleOptionChange(idx, e.target.value)}
                                                placeholder={`Choice ${idx + 1}`}
                                                className="!mb-0 !p-5 !px-8 border-2"
                                            />
                                        </div>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleRemoveOption(idx)}
                                            className="p-5 rounded-2xl opacity-40 group-hover:opacity-100 transition-opacity bg-red-500/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white shrink-0"
                                        >
                                            <FaTrash size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                )}

                {/* MATCH */}
                {type === 'match' && (
                    <div className="flex flex-col gap-6 px-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                            Matching Pairs
                        </label>

                        <div className="p-6 md:p-10 rounded-[32px] bg-black/10 border border-white/5 flex flex-col gap-8">

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-2">Specify Pairs</span>
                                <Button
                                    variant="secondary"
                                    onClick={handleAddMatchPair}
                                    type="button"
                                    className="py-3 px-6 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500 hover:text-white rounded-xl"
                                >
                                    <FaPlus className="mr-2" /> Add Pair
                                </Button>
                            </div>

                            <div className="flex flex-col gap-5">
                                {matchPairs.map((pair, idx) => (
                                    <div key={idx} className="flex gap-4 items-center group">
                                        <Input
                                            value={pair.left}
                                            onChange={e => handleMatchPairChange(idx, 'left', e.target.value)}
                                            placeholder="Term"
                                            className="!mb-0 flex-1 !p-5 !px-8 border-2"
                                        />
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                            <span className="text-slate-400 text-lg font-bold">↔</span>
                                        </div>
                                        <Input
                                            value={pair.right}
                                            onChange={e => handleMatchPairChange(idx, 'right', e.target.value)}
                                            placeholder="Definition"
                                            className="!mb-0 flex-1 !p-5 !px-8 border-2"
                                        />
                                        <Button
                                            variant="danger"
                                            onClick={() => handleRemoveMatchPair(idx)}
                                            className="p-5 rounded-2xl opacity-40 group-hover:opacity-100 transition-opacity bg-red-500/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white shrink-0"
                                        >
                                            <FaTrash size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                )}

                {/* CORRECT ANSWER */}
                <div className="flex flex-col gap-4 px-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400/70 px-1">
                        Set Correct Answer
                    </label>

                    <div className="p-6 md:p-10 rounded-[32px] bg-violet-500/5 border border-violet-500/10 shadow-inner">

                        {type === 'fill_blank' && (
                            <Input
                                value={correctAnswer}
                                onChange={e => setCorrectAnswer(e.target.value)}
                                placeholder="Enter the exact correct answer"
                                className="!p-6 !px-10 bg-black/40 border-violet-500/20 text-lg rounded-[24px]"
                            />
                        )}

                        {type === 'true_false' && (
                            <div className="flex gap-8">
                                {['True', 'False'].map(option => (
                                    <button
                                        key={option}
                                        onClick={() => handleSingleChoiceSelect(option)}
                                        className={`flex-1 py-6 rounded-[24px] font-bold transition-all border-2 text-xl ${correctAnswer === option
                                            ? 'bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/30 scale-[1.02]'
                                            : 'bg-black/20 border-white/5 text-slate-400 hover:border-violet-500/30'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}

                        {(type === 'single_choice' || type === 'multi_select') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {options.filter(o => o.trim()).map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() =>
                                            type === 'single_choice'
                                                ? handleSingleChoiceSelect(option)
                                                : handleMultiSelectToggle(option)
                                        }
                                        className={`p-6 rounded-[24px] flex items-center gap-6 transition-all border-2 text-left ${(type === 'single_choice' && correctAnswer === option) ||
                                            (type === 'multi_select' && Array.isArray(correctAnswer) && correctAnswer.includes(option))
                                            ? 'bg-violet-500/20 border-violet-500 text-white shadow-xl shadow-violet-500/10'
                                            : 'bg-black/20 border-white/5 text-slate-400 hover:border-violet-500/20'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${(type === 'single_choice' && correctAnswer === option) ||
                                            (type === 'multi_select' && Array.isArray(correctAnswer) && correctAnswer.includes(option))
                                            ? 'border-white bg-white'
                                            : 'border-slate-600'
                                            }`}>
                                            {((type === 'single_choice' && correctAnswer === option) ||
                                                (type === 'multi_select' && Array.isArray(correctAnswer) && correctAnswer.includes(option))) && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-violet-600"></div>
                                                )}
                                        </div>
                                        <span className="font-bold text-lg truncate">{option}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {type === 'match' && (
                            <div className="flex flex-col items-center justify-center gap-4 text-violet-400/60 bg-violet-500/5 p-8 rounded-2xl border border-violet-500/10">
                                <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center text-3xl">🔗</div>
                                <p className="text-sm font-black uppercase tracking-widest text-center">
                                    Correct pairs are mapped automatically.
                                </p>
                            </div>
                        )}

                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 pt-12 border-t border-white/10 px-2 mt-4">
                    <Button onClick={handleSubmit} className="flex-[2] py-6 rounded-[32px] text-2xl font-black shadow-2xl shadow-violet-500/40 hover:scale-[1.02] transition-transform">
                        ✨ Save Question
                    </Button>
                    <Button variant="outline" onClick={onCancel} className="flex-1 py-6 rounded-[32px] border-white/10 text-slate-400 hover:bg-white/5 font-black text-lg">
                        Discard
                    </Button>
                </div>

            </div>
        </Card>
    );
}
