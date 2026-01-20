interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    className?: string;
}

export default function Input({ label, className, ...props }: InputProps) {
    return (
        <div className="mb-4 w-full">
            {label && <label className="block mb-2 text-xs text-slate-400 uppercase tracking-wider">{label}</label>}
            <input
                className={`w-full px-3 py-3 rounded-[12px] border border-white/10 bg-black/20 text-white outline-none text-base ${className || ''}`}
                {...props}
            />
        </div>
    );
}
