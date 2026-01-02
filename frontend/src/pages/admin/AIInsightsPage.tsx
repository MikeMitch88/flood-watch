import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, ArrowRight } from 'lucide-react';
import { AIInsights } from '../../components/admin/AIInsights';

export default function AIInsightsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        AI Insights
                    </h1>
                    <p className="text-slate-400">AI-powered analysis and recommendations for flood management</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-bold">Powered by AI</span>
                </div>
            </div>

            {/* Main Insights Component */}
            <AIInsights />

            {/* Additional Insights Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Analysis */}
                <div className="glass-strong rounded-xl p-6 border border-slate-700/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Trend Analysis</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-ocean-900/30 rounded-lg">
                            <span className="text-slate-300">Report Frequency</span>
                            <span className="text-cyan-400 font-bold">↑ 35%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-ocean-900/30 rounded-lg">
                            <span className="text-slate-300">Verification Rate</span>
                            <span className="text-green-400 font-bold">↑ 12%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-ocean-900/30 rounded-lg">
                            <span className="text-slate-300">Response Time</span>
                            <span className="text-orange-400 font-bold">↓ 8%</span>
                        </div>
                    </div>
                </div>

                {/* Risk Assessment */}
                <div className="glass-strong rounded-xl p-6 border border-slate-700/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Risk Assessment</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-red-400 font-bold">High Risk Areas</span>
                                <span className="text-red-400">3</span>
                            </div>
                            <p className="text-sm text-slate-400">Nairobi River Basin, Coastal Region, Lake Victoria</p>
                        </div>
                        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-orange-400 font-bold">Medium Risk Areas</span>
                                <span className="text-orange-400">7</span>
                            </div>
                            <p className="text-sm text-slate-400">Urban centers with poor drainage systems</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Items */}
            <div className="glass-strong rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Recommended Actions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-ocean-900/30 rounded-lg hover:bg-ocean-900/50 transition-colors cursor-pointer group">
                        <Lightbulb className="w-8 h-8 text-yellow-400 mb-3" />
                        <h4 className="text-white font-bold mb-2">Increase Alert Radius</h4>
                        <p className="text-sm text-slate-400 mb-3">Expand coverage to 15km for critical incidents</p>
                        <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold group-hover:gap-3 transition-all">
                            <span>Take Action</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="p-4 bg-ocean-900/30 rounded-lg hover:bg-ocean-900/50 transition-colors cursor-pointer group">
                        <Lightbulb className="w-8 h-8 text-yellow-400 mb-3" />
                        <h4 className="text-white font-bold mb-2">Deploy Resources</h4>
                        <p className="text-sm text-slate-400 mb-3">Allocate emergency teams to high-risk zones</p>
                        <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold group-hover:gap-3 transition-all">
                            <span>Take Action</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="p-4 bg-ocean-900/30 rounded-lg hover:bg-ocean-900/50 transition-colors cursor-pointer group">
                        <Lightbulb className="w-8 h-8 text-yellow-400 mb-3" />
                        <h4 className="text-white font-bold mb-2">Schedule Verification</h4>
                        <p className="text-sm text-slate-400 mb-3">Optimize verification during peak hours (6-9 AM)</p>
                        <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold group-hover:gap-3 transition-all">
                            <span>Take Action</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
