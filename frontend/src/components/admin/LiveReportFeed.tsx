import React, { useState, useEffect, useCallback } from 'react';
import {
    MessageSquare, AlertTriangle, CheckCircle, Clock, ShieldCheck,
    MapPin, ArrowUpCircle, RefreshCw, Radio, Zap, XCircle
} from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface SmsReport {
    id: string;
    phone_number: string;
    message_body: string;
    extracted_location: string | null;
    status: 'pending' | 'clustered' | 'verified' | 'dismissed';
    timestamp: string;
    is_warden: boolean;
}

interface SmsIncident {
    id: string;
    severity: string;
    source: string;
    status: string;
    report_count: number;
    created_at: string;
}

export default function LiveReportFeed() {
    const [reports, setReports] = useState<SmsReport[]>([]);
    const [incidents, setIncidents] = useState<SmsIncident[]>([]);
    const [loading, setLoading] = useState(true);
    const [promoting, setPromoting] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [reportsRes, incidentsRes] = await Promise.all([
                api.get('/alerts/sms/reports?limit=50').catch(() => ({ data: [] })),
                api.get('/alerts/sms/incidents?limit=20').catch(() => ({ data: [] })),
            ]);

            const fetchedReports: SmsReport[] = reportsRes.data;
            const fetchedIncidents: SmsIncident[] = incidentsRes.data;

            // Use API data if available, otherwise fall back to demo data
            if (fetchedReports.length > 0) {
                setReports(fetchedReports);
            } else if (reports.length === 0) {
                // Only set demo data on first load when no API data
                setReports([
                    {
                        id: 'demo-1',
                        phone_number: '+254712345678',
                        message_body: 'Water level rising rapidly near the primary school in Kibera.',
                        extracted_location: 'Kibera',
                        status: 'pending',
                        timestamp: new Date().toISOString(),
                        is_warden: false,
                    },
                    {
                        id: 'demo-2',
                        phone_number: '+254799887766',
                        message_body: 'URGENT: River Nyando has burst its banks. Need evacuation assistance.',
                        extracted_location: 'Nyando',
                        status: 'verified',
                        timestamp: new Date(Date.now() - 300000).toISOString(),
                        is_warden: true,
                    },
                    {
                        id: 'demo-3',
                        phone_number: '+254711223344',
                        message_body: 'Flooding reported at Mathare bridge. Road impassable.',
                        extracted_location: 'Mathare',
                        status: 'clustered',
                        timestamp: new Date(Date.now() - 600000).toISOString(),
                        is_warden: false,
                    },
                    {
                        id: 'demo-4',
                        phone_number: '+254700112233',
                        message_body: 'Heavy rains in Budalangi. Water entering homes near the river.',
                        extracted_location: 'Budalangi',
                        status: 'pending',
                        timestamp: new Date(Date.now() - 900000).toISOString(),
                        is_warden: false,
                    },
                ]);
            }

            if (fetchedIncidents.length > 0) {
                setIncidents(fetchedIncidents);
            } else if (incidents.length === 0) {
                setIncidents([
                    {
                        id: 'demo-inc-1',
                        severity: 'high',
                        source: 'warden',
                        status: 'active',
                        report_count: 1,
                        created_at: new Date(Date.now() - 300000).toISOString(),
                    },
                    {
                        id: 'demo-inc-2',
                        severity: 'medium',
                        source: 'public_cluster',
                        status: 'active',
                        report_count: 6,
                        created_at: new Date(Date.now() - 1200000).toISOString(),
                    },
                ]);
            }
        } catch (err) {
            console.error('LiveReportFeed fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Poll every 15 seconds for near-real-time feel
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handlePromote = async (reportId: string) => {
        if (reportId.startsWith('demo-')) {
            // For demo reports, just update locally
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'verified' } : r));
            toast.success('Report promoted to active incident');
            return;
        }
        setPromoting(reportId);
        try {
            const res = await api.post(`/alerts/sms/reports/${reportId}/promote`);
            toast.success(res.data.message || 'Report promoted to active incident');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to promote report');
        } finally {
            setPromoting(null);
        }
    };

    const handleDismiss = (reportId: string) => {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
        toast.success('Report dismissed');
    };

    const getTimeAgo = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const getSeverityConfig = (severity: string) => {
        switch (severity) {
            case 'critical':
                return { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/40', bar: 'bg-red-500' };
            case 'high':
                return { color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/40', bar: 'bg-orange-500' };
            case 'medium':
                return { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/40', bar: 'bg-amber-500' };
            default:
                return { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/40', bar: 'bg-blue-500' };
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-slate-700/80 text-slate-300 border border-slate-600/50';
            case 'verified':
                return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
            case 'clustered':
                return 'bg-purple-500/20 text-purple-400 border border-purple-500/40';
            case 'dismissed':
                return 'bg-red-500/10 text-red-400/60 border border-red-500/20';
            default:
                return 'bg-slate-700 text-slate-300';
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-strong rounded-2xl border border-slate-700/30 h-[600px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-400 text-sm font-medium">Loading SMS stream…</span>
                    </div>
                </div>
                <div className="glass-strong rounded-2xl border border-slate-700/30 h-[600px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-400 text-sm font-medium">Loading incidents…</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ─── Left Column: Incoming SMS Stream ─── */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative glass-strong rounded-2xl border border-rain-600/30 hover:border-blue-500/40 transition-all duration-300 overflow-hidden flex flex-col h-[620px]">
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-navy-900 to-ocean-900/80 border-b border-slate-700/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-lg">Live SMS Stream</h2>
                                <p className="text-xs text-slate-500">{reports.length} reports received</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchData}
                                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <span className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/30">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Listening
                            </span>
                        </div>
                    </div>

                    {/* Reports List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {reports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <Radio className="w-10 h-10 mb-3 opacity-40" />
                                <p className="font-medium">No incoming reports</p>
                                <p className="text-xs mt-1">Waiting for SMS messages…</p>
                            </div>
                        ) : (
                            reports.map((report) => (
                                <div
                                    key={report.id}
                                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                                        report.is_warden
                                            ? 'bg-gradient-to-r from-amber-900/25 to-orange-900/15 border-amber-500/40 shadow-sm shadow-amber-500/10'
                                            : report.status === 'dismissed'
                                            ? 'bg-navy-800/30 border-slate-800/50 opacity-60'
                                            : 'bg-navy-800/50 border-slate-700/50 hover:border-slate-600/60'
                                    }`}
                                >
                                    {/* Header row */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-sm text-slate-300 bg-slate-800/50 px-2 py-0.5 rounded">
                                                {report.phone_number}
                                            </span>
                                            {report.is_warden && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                                                    <ShieldCheck className="w-3 h-3" /> Warden
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                                            <Clock className="w-3 h-3" />
                                            {getTimeAgo(report.timestamp)}
                                        </span>
                                    </div>

                                    {/* Message body */}
                                    <p className="text-white text-sm mb-3 leading-relaxed">{report.message_body}</p>

                                    {/* Footer row */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {report.extracted_location && (
                                                <span className="flex items-center gap-1 text-xs bg-slate-800/70 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/50">
                                                    <MapPin className="w-3 h-3 text-cyan-400" /> {report.extracted_location}
                                                </span>
                                            )}
                                            <span className={`text-xs px-2 py-1 rounded-lg font-bold ${getStatusBadge(report.status)}`}>
                                                {report.status.toUpperCase()}
                                            </span>
                                        </div>

                                        {report.status === 'pending' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDismiss(report.id)}
                                                    className="text-xs text-slate-500 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                                                    title="Dismiss report"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePromote(report.id)}
                                                    disabled={promoting === report.id}
                                                    className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-3 py-1.5 rounded-lg transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
                                                >
                                                    <ArrowUpCircle className="w-3.5 h-3.5" />
                                                    {promoting === report.id ? 'Promoting…' : 'Verify'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Right Column: Active Incidents ─── */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative glass-strong rounded-2xl border border-rain-600/30 hover:border-red-500/30 transition-all duration-300 overflow-hidden flex flex-col h-[620px]">
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-navy-900 to-ocean-900/80 border-b border-slate-700/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg shadow-red-500/30">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-lg">Active Incidents</h2>
                                <p className="text-xs text-slate-500">{incidents.length} requiring attention</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 bg-red-500/15 text-red-400 rounded-full border border-red-500/30">
                            {incidents.length} Active
                        </span>
                    </div>

                    {/* Incidents List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {incidents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <CheckCircle className="w-10 h-10 mb-3 opacity-40" />
                                <p className="font-medium">No active incidents</p>
                                <p className="text-xs mt-1">All clear for now</p>
                            </div>
                        ) : (
                            incidents.map((incident) => {
                                const sevConfig = getSeverityConfig(incident.severity);
                                return (
                                    <div
                                        key={incident.id}
                                        className={`p-5 rounded-xl ${sevConfig.bg} border ${sevConfig.border} relative overflow-hidden transition-all duration-200 hover:scale-[1.01]`}
                                    >
                                        {/* Severity bar */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sevConfig.bar} rounded-r`}></div>

                                        <div className="pl-3">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Zap className={`w-4 h-4 ${sevConfig.color}`} />
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${sevConfig.color}`}>
                                                        {incident.severity}
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {incident.created_at ? getTimeAgo(incident.created_at) : '—'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-500 text-xs mb-1">Source</span>
                                                    <span className="text-slate-200 capitalize font-medium">
                                                        {incident.source.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-500 text-xs mb-1">Reports</span>
                                                    <span className="text-slate-200 font-bold">{incident.report_count}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-500 text-xs mb-1">Status</span>
                                                    <span className="flex items-center gap-1 text-emerald-400 font-medium capitalize">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                                        {incident.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
