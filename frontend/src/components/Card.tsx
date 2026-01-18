export default function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`glass ${className}`} style={{ padding: '1.5rem', borderRadius: 'var(--radius)', color: 'var(--foreground)' }} {...props}>
            {children}
        </div>
    );
}
