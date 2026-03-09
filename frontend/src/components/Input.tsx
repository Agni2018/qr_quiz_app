interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
    className?: string;
    containerClassName?: string;
}

export default function Input({ label, className, containerClassName, style, ...props }: InputProps) {
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.875rem 1.5rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'var(--transition)',
        ...style
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    return (
        <div className={`${containerClassName || 'mb-4'} w-full`}>
            {label && <label style={labelStyle}>{label}</label>}
            <input
                className={`focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 ${className || ''}`}
                style={inputStyle}
                {...props}
            />
        </div>
    );
}
