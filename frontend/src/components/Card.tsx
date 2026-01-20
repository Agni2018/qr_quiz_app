interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noGlass?: boolean;
}

export default function Card({ children, className = '', noGlass = false, ...props }: CardProps) {
    return (
        <div className={`${noGlass ? '' : 'glass'} p-6 rounded-[var(--radius)] text-[var(--foreground)] ${className}`} {...props}>
            {children}
        </div>
    );
}
