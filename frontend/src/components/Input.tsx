interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export default function Input({ label, style, ...props }: InputProps) {
    return (
        <div style={{ marginBottom: '1rem', width: '100%' }}>
            {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>{label}</label>}
            <input
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '1rem',
                    ...style
                }}
                {...props}
            />
        </div>
    );
}
