import React from 'react';

export type StatusLevel = 'operational' | 'elevated' | 'critical';

interface StatusIndicatorProps {
    status: StatusLevel;
    className?: string;
}

const statusConfig = {
    operational: {
        label: 'OPERATIONAL',
        color: 'text-safe-500',
        bg: 'bg-safe-500/10',
        border: 'border-safe-500/30',
        glow: 'shadow-glow-safe',
        icon: '🟢',
    },
    elevated: {
        label: 'ELEVATED',
        color: 'text-warning-500',
        bg: 'bg-warning-500/10',
        border: 'border-warning-500/30',
        glow: 'shadow-glow-warning',
        icon: '🟡',
    },
    critical: {
        label: 'CRITICAL',
        color: 'text-critical-500',
        bg: 'bg-critical-500/10',
        border: 'border-critical-500/30',
        glow: 'shadow-glow-critical',
        icon: '🔴',
    },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, className = '' }) => {
    const config = statusConfig[status];

    return (
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border ${config.bg} ${config.border} ${config.glow} ${className}`}>
            <div className="relative flex items-center">
                <div className={`w-3 h-3 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse-slow`}></div>
                <div className={`absolute w-3 h-3 rounded-full ${config.color.replace('text-', 'bg-')} opacity-50 animate-ping`}></div>
            </div>
            <span className={`font-bold text-sm tracking-wider uppercase ${config.color}`}>
                System Status: {config.label}
            </span>
        </div>
    );
};

export default StatusIndicator;
