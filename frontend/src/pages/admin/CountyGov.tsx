import { useState } from 'react';
import { 
    Building, Users, Truck, AlertTriangle, CloudRain, ShieldAlert,
    MapPin, Activity, Droplets, TrendingDown, CheckCircle, Package
} from 'lucide-react';
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

// Mock Data for County Operations
const waterLevelData = [
    { time: '00:00', level: 2.1, predicted: 2.1 },
    { time: '04:00', level: 3.4, predicted: 3.2 },
    { time: '08:00', level: 4.8, predicted: 4.5 },
    { time: '12:00', level: 5.9, predicted: 6.1 },
    { time: '16:00', level: null, predicted: 5.4 },
    { time: '20:00', level: null, predicted: 4.2 },
    { time: '24:00', level: null, predicted: 3.0 },
];

const resourceAllocation = [
    { name: 'Rescue Boats', allocated: 45, total: 50 },
    { name: 'Med Kits', allocated: 850, total: 1000 },
    { name: 'Food Rations', allocated: 3200, total: 5000 },
    { name: 'Shelter Beds', allocated: 890, total: 1200 },
];

export default function CountyGov() {
    const [activeTab, setActiveTab] = useState<'overview' | 'infrastructure' | 'resources'>('overview');

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display tracking-tight flex items-center gap-3">
                        <Building className="text-teal-400 w-8 h-8" />
                        County Operations Command
                    </h1>
                    <p className="text-rain-400 mt-1 text-sm md:text-base">
                        Real-time infrastructure impact, resource allocation, and evacuation tracking.
                    </p>
                </div>
                
                <div className="flex bg-navy-900/50 p-1 rounded-xl border border-slate-700/50">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('infrastructure')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'infrastructure' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Infrastructure
                    </button>
                    <button 
                        onClick={() => setActiveTab('resources')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'resources' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Resources
                    </button>
                </div>
            </div>

            {/* Emergency Status Banner */}
            <div className="bg-gradient-to-r from-critical-600/20 via-critical-500/10 to-transparent border-l-4 border-critical-500 p-4 rounded-r-xl flex items-start gap-4">
                <AlertTriangle className="text-critical-400 w-6 h-6 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-critical-100 font-bold text-lg">Active Emergency Declaration (Level 3)</h3>
                    <p className="text-critical-200/80 text-sm mt-1">
                        Nairobi River basin has exceeded flood stage by 1.2 meters. Mandatory evacuation orders in effect for informal settlements in Zone B.
                    </p>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-strong rounded-2xl p-5 border border-rain-700/30 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-rain-400 text-sm font-semibold">Population at Risk</p>
                            <h3 className="text-2xl font-bold text-white font-display">24,500</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-strong rounded-2xl p-5 border border-rain-700/30 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-rain-400 text-sm font-semibold">Critical Infra Impacted</p>
                            <h3 className="text-2xl font-bold text-white font-display">12 Sites</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-strong rounded-2xl p-5 border border-rain-700/30 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-teal-500/20 rounded-xl text-teal-400">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-rain-400 text-sm font-semibold">Active Responders</p>
                            <h3 className="text-2xl font-bold text-white font-display">142</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-strong rounded-2xl p-5 border border-rain-700/30 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-rain-400 text-sm font-semibold">Evac Centers Open</p>
                            <h3 className="text-2xl font-bold text-white font-display">4 / 7</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Predictive Timeline (Chart) */}
                <div className="lg:col-span-2 glass-strong rounded-2xl p-6 border border-rain-700/30">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Droplets className="w-5 h-5 text-blue-400" />
                                Flood Stage Prediction
                            </h3>
                            <p className="text-sm text-rain-400">AI forecasted water levels for next 12 hours</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs text-rain-300">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Actual
                            </span>
                            <span className="flex items-center gap-1 text-xs text-rain-300">
                                <div className="w-2 h-2 rounded-full border border-teal-500 border-dashed"></div> Predicted
                            </span>
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={waterLevelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#475569" tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis stroke="#475569" tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
                                <Line type="monotone" dataKey="predicted" stroke="#14b8a6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Resource Allocation */}
                <div className="glass-strong rounded-2xl p-6 border border-rain-700/30">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                        <Package className="w-5 h-5 text-purple-400" />
                        Resource Allocation
                    </h3>
                    <p className="text-sm text-rain-400 mb-6">Current deployment vs availability</p>
                    
                    <div className="space-y-5">
                        {resourceAllocation.map((resource, i) => {
                            const percent = (resource.allocated / resource.total) * 100;
                            let color = 'bg-teal-500';
                            if (percent > 85) color = 'bg-rose-500';
                            else if (percent > 70) color = 'bg-amber-500';
                            
                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-medium">{resource.name}</span>
                                        <span className="text-rain-400 font-mono">
                                            {resource.allocated} / {resource.total}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden border border-slate-800">
                                        <div 
                                            className={`h-full ${color} rounded-full relative`}
                                            style={{ width: `${percent}%` }}
                                        >
                                            {percent > 85 && (
                                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    
                    <button className="w-full mt-6 py-2.5 rounded-xl border border-teal-500/30 text-teal-400 font-bold hover:bg-teal-500 hover:text-white transition-all text-sm flex items-center justify-center gap-2">
                        <Truck className="w-4 h-4" /> Request Mutual Aid
                    </button>
                </div>
            </div>

            {/* Infrastructure List */}
            <div className="glass-strong rounded-2xl p-6 border border-rain-700/30">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                    <MapPin className="w-5 h-5 text-rose-400" />
                    Critical Infrastructure Status
                </h3>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-rain-400 border-b border-slate-700/50">
                            <tr>
                                <th className="pb-3 font-semibold">Infrastructure</th>
                                <th className="pb-3 font-semibold">Type</th>
                                <th className="pb-3 font-semibold">Status</th>
                                <th className="pb-3 font-semibold">Est. Clearance</th>
                                <th className="pb-3 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            <tr>
                                <td className="py-4 text-white font-medium">Thika Superhighway Underpass</td>
                                <td className="py-4 text-slate-400">Transport</td>
                                <td className="py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-critical-500/20 text-critical-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-critical-400 animate-pulse"></div>
                                        Flooded
                                    </span>
                                </td>
                                <td className="py-4 text-slate-400">+14 Hours</td>
                                <td className="py-4 text-right">
                                    <button className="text-teal-400 hover:text-teal-300 font-medium text-xs">Dispatch Pump</button>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-4 text-white font-medium">Kibera Primary School (Shelter)</td>
                                <td className="py-4 text-slate-400">Evac Center</td>
                                <td className="py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                        At Capacity
                                    </span>
                                </td>
                                <td className="py-4 text-slate-400">-</td>
                                <td className="py-4 text-right">
                                    <button className="text-teal-400 hover:text-teal-300 font-medium text-xs">Reroute Evacuees</button>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-4 text-white font-medium">Substation 4 (Langata)</td>
                                <td className="py-4 text-slate-400">Power</td>
                                <td className="py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-safe-500/20 text-safe-400">
                                        <CheckCircle className="w-3 h-3" />
                                        Secured
                                    </span>
                                </td>
                                <td className="py-4 text-slate-400">-</td>
                                <td className="py-4 text-right">
                                    <button className="text-slate-500 hover:text-slate-300 font-medium text-xs">View Log</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
