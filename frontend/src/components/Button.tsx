interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
}

export default function Button({ children, variant = 'primary', className = '', style, disabled, ...props }: ButtonProps) {
    let baseStyle: React.CSSProperties = {
        padding: '0.75rem 1.5rem',
        borderRadius: 'var(--radius)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        fontSize: '0.95rem',
        transition: 'var(--transition)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        opacity: disabled ? 0.6 : 1,
        ...style
    };

    if (variant === 'primary') {
        baseStyle.background = 'var(--primary)';
        baseStyle.color = 'white';
        baseStyle.boxShadow = 'var(--shadow-md)';
    } else if (variant === 'secondary') {
        baseStyle.background = 'var(--secondary)';
        baseStyle.color = 'white';
        baseStyle.boxShadow = 'var(--shadow-md)';
    } else if (variant === 'danger') {
        baseStyle.background = 'var(--error)';
        baseStyle.color = 'white';
        baseStyle.boxShadow = 'var(--shadow-md)';
    } else if (variant === 'outline') {
        baseStyle.background = 'transparent';
        baseStyle.border = '1px solid var(--border-color)';
        baseStyle.color = 'var(--text-primary)';
    } else if (variant === 'ghost') {
        baseStyle.background = 'transparent';
        baseStyle.color = 'inherit';
    }

    return (
        <button
            className={`transition-all hover:scale-105 active:scale-95 ${className}`}
            style={baseStyle}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
