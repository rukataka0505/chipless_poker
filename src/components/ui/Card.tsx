import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'solid' | 'highlight';
    children: React.ReactNode;
}

export function Card({
    className = '',
    variant = 'default',
    children,
    ...props
}: CardProps) {
    const baseStyles = "rounded-[2rem] transition-all duration-300 relative overflow-hidden";

    const variants = {
        default: "glass-panel border border-white/5",
        solid: "bg-surface border border-white/5",
        highlight: "glass-panel border border-gold/30 shadow-[0_0_20px_rgba(255,215,0,0.1)]",
    };

    return (
        <div
            className={`
                ${baseStyles} 
                ${variants[variant]} 
                ${className}
            `}
            {...props}
        >
            {/* Glossy overlay effect for extra depth */}
            {variant === 'highlight' && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
