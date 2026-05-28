import { useState } from 'react';
import { 
    ShieldCheck, Search, BarChart3, 
    Home, Building2, Banknote, History, Download, ChevronRight
} from 'lucide-react';
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

const mockRiskData = [
    { subject: 'Elevation', A: 85, fullMark: 100 },
    { subject: 'Proximity to Water', A: 90, fullMark: 100 },
    { subject: 'Historical Frequency', A: 65, fullMark: 100 },
    { subject: 'Drainage Quality', A: 40, fullMark: 100 },
    { subject: 'Soil Permeability', A: 50, fullMark: 100 },
];

const mockDamageHistory = [
    { year: '2019', damageUSD: 120000, incidents: 2 },
    { year: '2020', damageUSD: 45000, incidents: 1 },
    { year: '2021', damageUSD: 0, incidents: 0 },
    { year: '2022', damageUSD: 310000, incidents: 4 },
    { year: '2023', damageUSD: 85000, incidents: 2 },
];

export default function InsuranceRisk() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        
        setIsAnalyzing(true);
        setShowResults(false);
        
        // Mock API call delay
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowResults(true);
        }, 1500);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display tracking-tight flex items-center gap-3">
                        <ShieldCheck className="text-purple-400 w-8 h-8" />
                        Insurance Risk Analytics (PRO)
                    </h1>
                    <p className="text-rain-400 mt-1 text-sm md:text-base">
                        Underwriter tool for localized flood risk assessment and damage probability modeling.
                    </p>
                </div>
                
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 border border-slate-700">
                    <Download className="w-4 h-4" /> Export Report PDF
                </button>
            </div>

            {/* Search Panel */}
            <div className="glass-strong rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-br from-navy-900 to-slate-900 shadow-xl shadow-purple-900/10">
                <form onSubmit={handleAnalyze} className="max-w-3xl">
                    <label className="block text-sm font-bold text-slate-300 mb-2">
                        Analyze Location (Coordinates, Address, or Property ID)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-navy-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="e.g. -1.2921, 36.8219 or 14 Riverside Drive..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAnalyzing || !searchQuery}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 min-w-[140px]"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>Run Assessment <ChevronRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Panel */}
            {showResults && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Risk Score */}
                        <div className="glass-strong rounded-2xl p-6 border border-critical-500/30 flex flex-col items-center justify-center relative overflow-hidden group bg-gradient-to-b from-transparent to-critical-900/20">
                            <div className="absolute top-0 right-0 p-4">
                                <div className="px-3 py-1 bg-critical-500/20 text-critical-400 text-xs font-bold rounded-full border border-critical-500/30">
                                    HIGH RISK
                                </div>
                            </div>
                            <p className="text-slate-400 font-bold mb-2 uppercase tracking-widest text-xs">Proprietary Risk Score</p>
                            <div className="relative flex items-center justify-center">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                                    <circle cx="64" cy="64" r="56" stroke="#ef4444" strokeWidth="12" fill="none" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * 78) / 100} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-4xl font-display font-bold text-white">78</span>
                                    <span className="text-xs text-rain-400">/ 100</span>
                                </div>
                            </div>
                            <p className="text-center text-sm text-slate-300 mt-4 max-w-[200px]">
                                Property is situated in a historical 10-year floodplain with poor drainage infrastructure.
                            </p>
                        </div>

                        {/* Radar Chart Component Breakdown */}
                        <div className="md:col-span-2 glass-strong rounded-2xl p-6 border border-rain-700/30">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                Risk Factors Breakdown
                            </h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRiskData}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Risk Level" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.3} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                            itemStyle={{ color: '#e2e8f0' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Financial Modeling */}
                        <div className="glass-strong rounded-2xl p-6 border border-rain-700/30">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-green-400" />
                                Damage Probability Matrix
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-navy-900 rounded-xl border border-slate-700 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-800 rounded-lg"><Home className="w-5 h-5 text-slate-300" /></div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Structural Damage (1m flood)</h4>
                                            <p className="text-xs text-slate-400">Probability: 24% annually</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-critical-400 font-bold font-mono">$42,500</span>
                                        <p className="text-xs text-slate-500">Est. Claim</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-navy-900 rounded-xl border border-slate-700 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-800 rounded-lg"><Building2 className="w-5 h-5 text-slate-300" /></div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Business Interruption</h4>
                                            <p className="text-xs text-slate-400">Probability: 45% annually</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-amber-400 font-bold font-mono">$15,000</span>
                                        <p className="text-xs text-slate-500">Est. Claim</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-purple-900/20 rounded-xl border border-purple-500/30">
                                <p className="text-sm text-purple-200">
                                    <span className="font-bold">AI Underwriting Recommendation:</span> Premium loading of +35% suggested for comprehensive flood cover. Consider mandatory elevation requirements for primary assets.
                                </p>
                            </div>
                        </div>

                        {/* Historical Chart */}
                        <div className="glass-strong rounded-2xl p-6 border border-rain-700/30">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-400" />
                                Historical Claims / Incidents (5 Yr)
                            </h3>
                            
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mockDamageHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="year" stroke="#475569" tick={{fill: '#64748b', fontSize: 12}} />
                                        <YAxis 
                                            stroke="#475569" 
                                            tick={{fill: '#64748b', fontSize: 12}}
                                            tickFormatter={(value) => `$${value/1000}k`}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Damage']}
                                            cursor={{fill: '#1e293b'}}
                                        />
                                        <Bar dataKey="damageUSD" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
