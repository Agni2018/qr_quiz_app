interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    className?: string;
    containerClassName?: string;
}

export default function TextArea({ label, className, containerClassName, style, ...props }: TextAreaProps) {
    const textAreaStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.875rem 1.5rem',

        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'var(--transition)',
        minHeight: '120px',
        resize: 'none',
        lineHeight: '1.6',
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
            <textarea
                className={`focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 ${className || ''}`}
                style={textAreaStyle}
                {...props}
            />
        </div>
    );
}
