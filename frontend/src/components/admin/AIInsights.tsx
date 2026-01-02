import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap } from 'lucide-react';

interface Insight {
    type: 'trend' | 'risk' | 'recommendation' | 'pattern';
    title: string;
    description: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
}

export const AIInsights: React.FC = () => {
    // Mock AI insights - in production, fetch from backend
    const insights: Insight[] = [
        {
            type: 'trend',
            title: 'Increasing Report Frequency',
            description: 'Reports have increased by 35% in the last 7 days, particularly in coastal regions. This suggests heightened flood activity.',
            confidence: 92,
        },
        {
            type: 'risk',
            title: 'High Risk Area Detected',
            description: 'Nairobi River basin showing clustering of 12 reports within 2km radius. Recommend immediate alert dispatch.',
            severity: 'high',
            confidence: 88,
        },
        {
            type: 'recommendation',
            title: 'Alert Optimization',
            description: 'Consider expanding alert radius to 15km for critical incidents based on historical impact patterns.',
            confidence: 76,
        },
        {
            type: 'pattern',
            title: 'Temporal Pattern Identified',
            description: 'Peak reporting occurs between 6-9 AM and 5-8 PM. Schedule verification resources accordingly.',
            confidence: 84,
        },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'trend':
                return TrendingUp;
            case 'risk':
                return AlertTriangle;
            case 'recommendation':
                return Lightbulb;
            case 'pattern':
                return Target;
            default:
                return Brain;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'trend':
                return 'from-cyan-500 to-blue-600';
            case 'risk':
                return 'from-orange-500 to-red-600';
            case 'recommendation':
                return 'from-emerald-500 to-green-600';
            case 'pattern':
                return 'from-purple-500 to-pink-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500/20 text-red-400 border-red-500/40';
            case 'high':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
            case 'low':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
            default:
                return '';
        }
    };

    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative glass-strong rounded-3xl p-8 border border-rain-600/30 hover:border-purple-500/40 transition-all duration-300 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3 font-display">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        AI Insights
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-sm font-bold">Powered by AI</span>
                    </div>
                </div>

                {/* Insights Grid */}
                <div className="space-y-4">
                    {insights.map((insight, index) => {
                        const Icon = getIcon(insight.type);
                        const typeColor = getTypeColor(insight.type);

                        return (
                            <div
                                key={index}
                                className="relative group/insight bg-ocean-900/30 rounded-xl p-5 border border-ocean-700/50 hover:border-purple-500/40 transition-all duration-300 hover:bg-ocean-900/50"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`p-3 bg-gradient-to-br ${typeColor} rounded-lg shadow-lg flex-shrink-0 group-hover/insight:scale-110 transition-transform`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h4 className="text-white font-bold text-base">{insight.title}</h4>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {insight.severity && (
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getSeverityColor(insight.severity)} uppercase`}>
                                                        {insight.severity}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-aqua-500/15 border border-aqua-500/30">
                                                    <div className="w-1.5 h-1.5 bg-aqua-400 rounded-full"></div>
                                                    <span className="text-aqua-400 text-xs font-bold">{insight.confidence}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-rain-300 text-sm leading-relaxed">{insight.description}</p>
                                    </div>
                                </div>

                                {/* Confidence Bar */}
                                <div className="mt-3 h-1 bg-ocean-800/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-aqua-500 to-cyan-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${insight.confidence}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-ocean-700/50">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-rain-400">
                            Last updated: {new Date().toLocaleTimeString()}
                        </span>
                        <button className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                            View All Insights →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
