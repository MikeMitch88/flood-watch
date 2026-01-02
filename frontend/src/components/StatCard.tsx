import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color?: 'teal' | 'safe' | 'warning' | 'critical' | 'info';
    className?: string;
}

const colorConfig = {
    teal: {
        icon: 'text-teal-400',
        bg: 'bg-teal-500/10',
        trend: 'text-teal-400',
    },
    safe: {
        icon: 'text-safe-400',
        bg: 'bg-safe-500/10',
        trend: 'text-safe-400',
    },
    warning: {
        icon: 'text-warning-400',
        bg: 'bg-warning-500/10',
        trend: 'text-warning-400',
    },
    critical: {
        icon: 'text-critical-400',
        bg: 'bg-critical-500/10',
        trend: 'text-critical-400',
    },
    info: {
        icon: 'text-info-400',
        bg: 'bg-info-500/10',
        trend: 'text-info-400',
    },
};

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon: Icon,
    trend,
    color = 'teal',
    className = '',
}) => {
    const config = colorConfig[color];

    return (
        <div className={`glass-card p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${config.bg}`}>
                    <Icon className={`w-6 h-6 ${config.icon}`} />
                </div>
                {trend && (
                    <span className={`text-xs font-bold uppercase tracking-wider ${trend.isPositive ? config.trend : 'text-slate-400'}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>
            <div className="text-3xl font-bold text-white font-display mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            <div className="text-sm text-slate-400">{label}</div>
        </div>
    );
};

export default StatCard;
