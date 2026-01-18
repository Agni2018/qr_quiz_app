interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export default function Button({ children, variant = 'primary', className = '', style, ...props }: ButtonProps) {
    let baseStyle: React.CSSProperties = {
        padding: '0.75rem 1.5rem',
        borderRadius: 'var(--radius)',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.95rem',
        transition: 'var(--transition)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        ...style
    };

    if (variant === 'primary') {
        baseStyle.background = 'var(--primary)';
        baseStyle.color = 'white';
    } else if (variant === 'secondary') {
        baseStyle.background = 'var(--secondary)';
        baseStyle.color = 'white';
    } else if (variant === 'danger') {
        baseStyle.background = '#ef4444';
        baseStyle.color = 'white';
    } else if (variant === 'outline') {
        baseStyle.background = 'transparent';
        baseStyle.border = '1px solid var(--glass-border)';
        baseStyle.color = 'var(--foreground)';
    }

    return (
        <button className={className} style={baseStyle} {...props}>
            {children}
        </button>
    );
}
