import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, incidentsAPI } from '../../api/client';
import {
    AlertCircle, FileText, Users, TrendingUp, Activity, Bell, MapPin,
    Zap, ArrowUp, ArrowDown, Sparkles, BarChart3
} from 'lucide-react';
import IncidentMap from '../../components/IncidentMap';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [incidents, setIncidents] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            analyticsAPI.getSummary(),
            incidentsAPI.getAll({ status: 'active' }),
            analyticsAPI.getReportsByDate(30),
        ])
            .then(([statsRes, incidentsRes, trendsRes]) => {
                setStats(statsRes.data);
                setIncidents(incidentsRes.data.slice(0, 5));
                setTrendData(trendsRes.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Dashboard error:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-6">
                    {/* Enhanced Loading Spinner */}
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-ocean-700/30 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-aqua-500 rounded-full animate-spin"></div>
                        <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-white font-semibold text-lg animate-pulse">Loading Dashboard</p>
                        <p className="text-rain-400 text-sm">Fetching real-time data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 animate-fade-in">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-aqua-500 to-cyan-600 rounded-2xl shadow-lg shadow-aqua-500/30">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white font-display bg-gradient-to-r from-white to-aqua-200 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <p className="text-rain-400 flex items-center gap-2 mt-1">
                                <Sparkles className="w-4 h-4 text-aqua-400" />
                                Real-time flood monitoring and analytics
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-mint-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative glass-strong border border-emerald-500/30 px-6 py-3 rounded-2xl hover:border-emerald-400/50 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-white font-bold tracking-wide">LIVE</span>
                            <div className="w-px h-4 bg-emerald-500/30"></div>
                            <span className="text-emerald-400 text-sm font-semibold">
                                {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <EnhancedStatCard
                    icon={FileText}
                    label="Total Reports"
                    value={stats?.total_reports || 0}
                    change={12}
                    changeLabel="from last month"
                    gradient="from-aqua-600 via-aqua-500 to-cyan-400"
                    iconBg="from-aqua-500 to-cyan-600"
                    glowColor="aqua-500"
                />
                <EnhancedStatCard
                    icon={AlertCircle}
                    label="Active Incidents"
                    value={stats?.active_incidents || 0}
                    change={-8}
                    changeLabel="from yesterday"
                    gradient="from-orange-600 via-orange-500 to-amber-500"
                    iconBg="from-orange-500 to-amber-600"
                    glowColor="orange-500"
                />
                <EnhancedStatCard
                    icon={Bell}
                    label="Alerts Sent"
                    value={stats?.alerts_sent || 0}
                    change={24}
                    changeLabel="this week"
                    gradient="from-emerald-600 via-emerald-500 to-mint-400"
                    iconBg="from-emerald-500 to-mint-500"
                    glowColor="emerald-500"
                />
                <EnhancedStatCard
                    icon={Users}
                    label="Active Users"
                    value={stats?.total_users || 0}
                    change={15}
                    changeLabel="new users"
                    gradient="from-cyan-500 via-sky-400 to-aqua-400"
                    iconBg="from-sky-500 to-aqua-600"
                    glowColor="sky-500"
                />
            </div>

            {/* Charts & Map Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enhanced Trend Chart */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-aqua-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative glass-strong rounded-3xl p-8 border border-rain-600/30 hover:border-aqua-500/40 transition-all duration-300 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3 font-display">
                                <div className="p-2 bg-gradient-to-br from-aqua-500 to-cyan-600 rounded-xl shadow-lg shadow-aqua-500/30">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                Incident Trends
                            </h3>
                            <span className="text-sm text-rain-400 font-semibold px-3 py-1 rounded-lg bg-ocean-800/50">
                                Last 30 Days
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a4365" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(10, 25, 41, 0.98)',
                                        border: '1px solid rgba(6, 182, 212, 0.3)',
                                        borderRadius: '16px',
                                        color: '#fff',
                                        padding: '12px 16px',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
                                    }}
                                    labelStyle={{ color: '#06b6d4', fontWeight: 'bold', marginBottom: '8px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#06b6d4"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncidents)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Enhanced Map */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative glass-strong rounded-3xl p-8 border border-rain-600/30 hover:border-orange-500/40 transition-all duration-300 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3 font-display">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/30">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                Active Incidents
                            </h3>
                            <span className="text-sm font-bold px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30">
                                {incidents.length} Active
                            </span>
                        </div>
                        <div className="h-[320px] rounded-2xl overflow-hidden ring-2 ring-ocean-700/50">
                            <IncidentMap incidents={incidents} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Recent Incidents Table */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative glass-strong rounded-3xl p-8 border border-rain-600/30 hover:border-aqua-500/40 transition-all duration-300 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3 font-display">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            Recent Incidents
                        </h3>
                        <Link
                            to="/admin/incidents"
                            className="text-sm font-bold text-aqua-400 hover:text-aqua-300 transition-colors px-4 py-2 rounded-lg hover:bg-aqua-500/10"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="overflow-x-auto rounded-xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-ocean-700/50">
                                    <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Status</th>
                                    <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Severity</th>
                                    <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Reports</th>
                                    <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Time</th>
                                    <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidents.map((incident, index) => (
                                    <tr
                                        key={incident.id}
                                        className="border-b border-ocean-800/50 hover:bg-gradient-to-r hover:from-aqua-500/5 hover:to-cyan-500/5 transition-all duration-200 group/row"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="py-5 px-6">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20 group-hover/row:shadow-emerald-500/40 transition-all">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                Active
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <SeverityBadge severity={incident.severity} />
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-aqua-500/20 border border-aqua-500/30">
                                                    <span className="text-aqua-400 font-bold text-sm">{incident.report_count}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-rain-300 font-medium text-sm">
                                            {new Date(incident.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-5 px-6">
                                            <Link
                                                to={`/admin/incidents/${incident.id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-aqua-500/10 to-cyan-500/10 hover:from-aqua-500/20 hover:to-cyan-500/20 text-aqua-400 hover:text-aqua-300 font-bold text-sm border border-aqua-500/30 hover:border-aqua-400/50 transition-all duration-200 transform hover:scale-105"
                                            >
                                                View
                                                <TrendingUp className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Enhanced Stat Card Component
function EnhancedStatCard({ icon: Icon, label, value, change, changeLabel, gradient, iconBg, glowColor }: any) {
    const isPositive = change >= 0;

    return (
        <div className="relative group">
            {/* Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-all duration-500`}></div>

            {/* Card */}
            <div className="relative glass-strong rounded-2xl p-6 border border-rain-600/30 hover:border-aqua-500/50 transition-all duration-300 overflow-hidden group-hover:shadow-2xl group-hover:shadow-${glowColor}/20 transform hover:scale-[1.02]">
                {/* Background Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                <div className="relative">
                    {/* Icon and Change Badge */}
                    <div className="flex items-start justify-between mb-6">
                        <div className={`p-4 bg-gradient-to-br ${iconBg} rounded-2xl shadow-lg shadow-${glowColor}/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                            <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm ${isPositive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}>
                            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            {Math.abs(change)}%
                        </div>
                    </div>

                    {/* Value */}
                    <div className="text-4xl font-bold text-white mb-2 font-display group-hover:scale-105 transition-transform origin-left">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>

                    {/* Label */}
                    <div className="text-rain-400 font-bold text-sm uppercase tracking-wider mb-1">
                        {label}
                    </div>

                    {/* Change Label */}
                    <div className="text-rain-500 text-xs font-semibold">
                        {changeLabel}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Severity Badge Component
function SeverityBadge({ severity }: { severity: string }) {
    const severityConfig: any = {
        critical: {
            bg: 'bg-red-500/15',
            text: 'text-red-400',
            border: 'border-red-500/40',
            glow: 'shadow-red-500/30',
        },
        high: {
            bg: 'bg-orange-500/15',
            text: 'text-orange-400',
            border: 'border-orange-500/40',
            glow: 'shadow-orange-500/30',
        },
        medium: {
            bg: 'bg-amber-500/15',
            text: 'text-amber-400',
            border: 'border-amber-500/40',
            glow: 'shadow-amber-500/30',
        },
        low: {
            bg: 'bg-blue-500/15',
            text: 'text-blue-400',
            border: 'border-blue-500/40',
            glow: 'shadow-blue-500/30',
        },
    };

    const config = severityConfig[severity.toLowerCase()] || severityConfig.low;

    return (
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${config.bg} ${config.text} border ${config.border} shadow-sm ${config.glow} uppercase tracking-wide`}>
            <Zap className="w-3.5 h-3.5" />
            {severity}
        </span>
    );
}
