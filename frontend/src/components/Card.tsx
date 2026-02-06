interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noGlass?: boolean;
}

export default function Card({ children, className = '', noGlass = false, style, ...props }: CardProps) {
    const baseStyle: React.CSSProperties = {
        background: noGlass ? 'var(--card-bg)' : 'var(--glass-bg)',
        backdropFilter: noGlass ? 'none' : 'blur(var(--blur))',
        border: `1px solid var(--card-border)`,
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-md)',
        transition: 'var(--transition)',
        ...style
    };

    return (
        <div className={className} style={baseStyle} {...props}>
            {children}
        </div>
    );
}
