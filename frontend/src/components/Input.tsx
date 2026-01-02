import React, { InputHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    helperText,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        {leftIcon}
                    </div>
                )}

                <input
                    className={`
                        block w-full 
                        ${leftIcon ? 'pl-10' : 'pl-4'} 
                        ${rightIcon ? 'pr-10' : 'pr-4'} 
                        py-3 
                        bg-navy-900/50 
                        border ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-teal-500/50 focus:border-teal-500/50'} 
                        rounded-xl 
                        text-white 
                        placeholder-slate-500 
                        focus:outline-none focus:ring-2 
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${className}
                    `}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                        {rightIcon}
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <div className="mt-1.5 flex items-center gap-1.5 px-1">
                    {error ? (
                        <>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-500">{error}</span>
                        </>
                    ) : (
                        <span className="text-sm text-slate-500">{helperText}</span>
                    )}
                </div>
            )}
        </div>
    );
};
