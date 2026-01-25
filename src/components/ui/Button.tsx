import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold' | 'electric';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export function Button({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 rounded-xl overflow-hidden group active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10",
        secondary: "bg-surface text-white border border-white/10 hover:bg-white/5 hover:border-white/20",
        danger: "bg-red-900/50 text-red-200 border border-red-500/30 hover:bg-red-900/80 hover:border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
        // Special luxe variants
        gold: "bg-gradient-to-b from-gold to-gold-dim text-black shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] border border-gold/50",
        electric: "bg-gradient-to-b from-electric to-electric-dim text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] border border-electric/50",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-12 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        xl: "h-16 px-10 text-lg",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* Interactive sheen effect for luxe buttons */}
            {(variant === 'gold' || variant === 'electric') && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            )}

            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : icon ? (
                <span className="mr-2 group-hover:scale-110 transition-transform duration-200">{icon}</span>
            ) : null}

            <span className="relative z-10 font-display uppercase tracking-widest">{children}</span>
        </button>
    );
}
