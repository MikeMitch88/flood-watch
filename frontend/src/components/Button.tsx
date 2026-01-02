import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'glass' | 'danger' | 'success' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    icon?: React.ReactNode;
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    icon,
    className = '',
    isLoading = false,
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/20 active:scale-95",
        secondary: "bg-transparent border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white active:scale-95",
        glass: "bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm border border-white/10 active:scale-95",
        danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20",
        success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20",
        outline: "border-2 border-teal-500 text-teal-400 hover:bg-teal-500/10",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3.5 text-base",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : icon ? (
                <span className="mr-2">{icon}</span>
            ) : null}
            {children}
        </button>
    );
};
