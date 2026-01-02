import React from 'react';

interface BadgeProps {
    variant: 'success' | 'warning' | 'danger' | 'info';
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    variant,
    children,
    icon,
    className = ''
}) => {
    const variantClasses = {
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        info: 'badge-info',
    };

    return (
        <span className={`badge ${variantClasses[variant]} ${className}`}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
};
