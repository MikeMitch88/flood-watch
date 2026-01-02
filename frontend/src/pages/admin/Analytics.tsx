import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../api/client';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Download, Users, FileText, Sparkles, Activity } from 'lucide-react';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface AnalyticsSummary {
    total_reports: number;
    total_incidents: number;
    active_incidents: number;
    total_alerts_sent: number;
    total_users: number;
    verified_reports: number;
    pending_reports: number;
}

interface ReportsByDate {
    date: string;
    count: number;
    verified_count: number;
}

interface SeverityData {
    severity: string;
    count: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-strong p-4 rounded-xl border border-rain-600/30">
                <p className="text-white font-bold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-rain-300 capitalize">{entry.name}:</span>
                        <span className="text-white font-mono font-bold">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function Analytics() {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [trendData, setTrendData] = useState<ReportsByDate[]>([]);
    const [severityData, setSeverityData] = useState<SeverityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [summaryRes, trendsRes, severityRes] = await Promise.all([
                analyticsAPI.getSummary(),
                analyticsAPI.getReportsByDate(timeRange),
                analyticsAPI.getSeverityBreakdown()
            ]);

            setSummary(summaryRes.data);
            setTrendData(trendsRes.data);
            setSeverityData(severityRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = {
        low: '#3b82f6',
        medium: '#f59e0b',
        high: '#f97316',
        critical: '#ef4444'
    };

    const SEVERITY_COLORS = ['#3b82f6', '#f59e0b', '#f97316', '#ef4444']; // Blue, Amber, Orange, Red

    const exportData = () => {
        const csv = [
            ['Date', 'Total Reports', 'Verified Reports'],
            ...trendData.map(d => [d.date, d.count, d.verified_count])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flood-watch-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-ocean-700/30 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-pink-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-white font-semibold text-lg animate-pulse">Analyzing Data</p>
                        <p className="text-rain-400 text-sm">Processing flood metrics...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 animate-fade-in">
            {/* Enhanced Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg shadow-pink-500/30">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                                Analytics
                            </h1>
                            <p className="text-rain-400 flex items-center gap-2 mt-1">
                                <Sparkles className="w-4 h-4 text-pink-400" />
                                Deep insights and performance metrics
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-ocean-900/50 p-2 rounded-2xl border border-rain-700/50">
                    <div className="flex gap-2 p-1 bg-ocean-800 rounded-xl">
                        {[7, 30, 90].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === range
                                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                                    : 'text-rain-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {range}D
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={exportData}
                        className="px-4 py-3 bg-ocean-800 hover:bg-pink-500/20 text-pink-400 hover:text-pink-300 rounded-xl font-bold transition-all border border-transparent hover:border-pink-500/30 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Reports', value: summary?.total_reports, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Active Incidents', value: summary?.active_incidents, icon: Activity, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Verified Reports', value: summary?.verified_reports, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'System Users', value: summary?.total_users, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' }
                ].map((stat, i) => (
                    <div key={i} className="glass-strong rounded-2xl p-6 border border-rain-600/30 hover:translate-y-[-2px] transition-transform duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${stat.color}`}>+12.5%</span>
                        </div>
                        <div className="text-3xl font-bold text-white font-display">{stat.value?.toLocaleString() || 0}</div>
                        <div className="text-sm text-rain-400 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reports Trend Chart */}
                <div className="glass-strong rounded-2xl p-6 border border-rain-600/30">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                                <BarChart3 className="w-5 h-5 text-pink-400" />
                                Report Trends
                            </h3>
                            <p className="text-rain-400 text-sm">Daily submission volume</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    name="Total Reports"
                                    stroke="#ec4899"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorReports)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="verified_count"
                                    name="Verified"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVerified)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Severity Distribution */}
                <div className="glass-strong rounded-2xl p-6 border border-rain-600/30">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                                <PieChartIcon className="w-5 h-5 text-aqua-400" />
                                Severity Distribution
                            </h3>
                            <p className="text-rain-400 text-sm">Reports by severity level</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={severityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="severity"
                                >
                                    {severityData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper icons
function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
