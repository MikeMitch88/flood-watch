import { useEffect, useState } from 'react';
import { alertsAPI, incidentsAPI } from '../../api/client';
import { Bell, Send, AlertTriangle, Clock, CheckCircle, XCircle, RefreshCw, Users, ShieldAlert, Sparkles, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../../components/Modal';

interface Alert {
    id: string;
    incident_id: string;
    severity: 'advisory' | 'watch' | 'warning' | 'emergency';
    message: string;
    affected_radius_km: number;
    recipients_count: number;
    delivery_status: 'pending' | 'sending' | 'sent' | 'failed';
    created_at: string;
    sent_at?: string;
}

interface Incident {
    id: string;
    severity: string;
    status: string;
    report_count: number;
    created_at: string;
}

export default function Alerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedIncidentId, setSelectedIncidentId] = useState('');
    const [alertSeverity, setAlertSeverity] = useState<'advisory' | 'watch' | 'warning' | 'emergency'>('watch');
    const [alertMessage, setAlertMessage] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [alertsRes, incidentsRes] = await Promise.all([
                alertsAPI.getAll(),
                incidentsAPI.getActive()
            ]);
            setAlerts(alertsRes.data);
            setIncidents(incidentsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIncidentId) {
            toast.error('Please select an incident');
            return;
        }

        try {
            setCreating(true);
            await alertsAPI.createForIncident(selectedIncidentId, alertSeverity);
            toast.success('Alert sent successfully!');
            setShowCreateModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error('Failed to create alert');
        } finally {
            setCreating(false);
        }
    };

    const handleRetry = async (alertId: string) => {
        try {
            await alertsAPI.retry(alertId);
            toast.success('Alert retry initiated');
            fetchData();
        } catch (error) {
            toast.error('Failed to retry alert');
        }
    };

    const resetForm = () => {
        setSelectedIncidentId('');
        setAlertSeverity('watch');
        setAlertMessage('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-ocean-700/30 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-white font-semibold text-lg animate-pulse">Loading Alerts Hub</p>
                        <p className="text-rain-400 text-sm">Syncing notification systems...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30">
                            <Megaphone className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                Alerts
                            </h1>
                            <p className="text-rain-400 flex items-center gap-2 mt-1">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                Manage public warnings and notifications
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="relative glass-strong border border-rain-600/30 px-6 py-3 rounded-2xl hover:border-purple-500/50 transition-all flex items-center gap-3 font-bold transform hover:scale-105 duration-300"
                    >
                        <Send className="w-5 h-5 text-purple-400" />
                        <span className="text-white">Send New Alert</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-strong rounded-2xl p-6 border border-rain-600/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Bell className="w-6 h-6 text-purple-400" />
                        </div>
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Total Sent</span>
                    </div>
                    <div className="text-3xl font-bold text-white font-display">{alerts.length}</div>
                    <div className="text-sm text-rain-400 mt-1">Lifetime alerts issued</div>
                </div>
                <div className="glass-strong rounded-2xl p-6 border border-rain-600/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Success Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-white font-display">
                        {alerts.length > 0 ? Math.round((alerts.filter(a => a.delivery_status === 'sent').length / alerts.length) * 100) : 0}%
                    </div>
                    <div className="text-sm text-rain-400 mt-1">Delivery confirmation</div>
                </div>
                <div className="glass-strong rounded-2xl p-6 border border-rain-600/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-orange-400" />
                        </div>
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Reach</span>
                    </div>
                    <div className="text-3xl font-bold text-white font-display">
                        {alerts.reduce((acc, curr) => acc + (curr.recipients_count || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-rain-400 mt-1">Total recipients notified</div>
                </div>
            </div>

            <div className="glass-strong rounded-2xl p-8 border border-rain-600/30 shadow-2xl">
                <div className="overflow-x-auto rounded-xl">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-ocean-700/50">
                                <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Severity</th>
                                <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Message</th>
                                <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Recipients</th>
                                <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Sent At</th>
                                <th className="text-left py-4 px-6 text-rain-400 font-bold text-sm uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((alert, index) => (
                                <tr
                                    key={alert.id}
                                    className="border-b border-ocean-800/50 hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-indigo-500/5 transition-all duration-200"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="py-5 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border
                                            ${alert.severity === 'emergency' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                                                alert.severity === 'warning' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                                                    alert.severity === 'watch' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                                                        'bg-blue-500/15 text-blue-400 border-blue-500/30'}`}>
                                            <AlertTriangle className="w-3 h-3" />
                                            {alert.severity}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="max-w-md truncate text-white font-medium" title={alert.message}>
                                            {alert.message}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-2 text-rain-300">
                                            <Users className="w-4 h-4" />
                                            <span className="font-semibold">{alert.recipients_count.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-2">
                                            {alert.delivery_status === 'sent' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                            {alert.delivery_status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                                            {alert.delivery_status === 'pending' && <Clock className="w-4 h-4 text-amber-400 animate-pulse" />}
                                            <span className={`capitalize font-bold text-sm ${alert.delivery_status === 'sent' ? 'text-emerald-400' :
                                                alert.delivery_status === 'failed' ? 'text-red-400' :
                                                    'text-amber-400'
                                                }`}>
                                                {alert.delivery_status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className="text-rain-400 text-sm">
                                            {new Date(alert.created_at).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6">
                                        {alert.delivery_status === 'failed' && (
                                            <button
                                                onClick={() => handleRetry(alert.id)}
                                                className="p-2 rounded-lg bg-ocean-800 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-all hover:scale-110 border border-transparent hover:border-purple-500/30"
                                                title="Retry Sending"
                                            >
                                                <RefreshCw className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {alerts.length === 0 && (
                        <div className="text-center py-12 text-rain-400 flex flex-col items-center gap-4">
                            <Bell className="w-12 h-12 text-rain-700" />
                            <p>No alerts have been issued yet</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={showCreateModal} title="Create New Alert" onClose={() => setShowCreateModal(false)}>
                <div className="space-y-6">
                    <div className="border-b border-rain-700/50 pb-4">
                        <h2 className="text-2xl font-bold font-display bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                            Issue New Alert
                        </h2>
                        <p className="text-rain-400 mt-1">Send emergency notifications to affected areas</p>
                    </div>

                    <form onSubmit={handleCreateAlert} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-rain-400 text-xs font-bold uppercase tracking-wider">Select Incident</label>
                            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto pr-2">
                                {incidents.map((incident) => (
                                    <div
                                        key={incident.id}
                                        onClick={() => setSelectedIncidentId(incident.id)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedIncidentId === incident.id
                                            ? 'bg-purple-500/20 border-purple-500'
                                            : 'bg-ocean-900/30 border-rain-700 hover:border-rain-500'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ShieldAlert className={`w-4 h-4 ${selectedIncidentId === incident.id ? 'text-purple-400' : 'text-rain-400'}`} />
                                                <span className="text-white font-medium">Incident #{incident.id.slice(0, 8)}</span>
                                            </div>
                                            <span className="text-xs text-rain-400">{new Date(incident.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-rain-400 text-xs font-bold uppercase tracking-wider">Severity Level</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['advisory', 'watch', 'warning', 'emergency'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setAlertSeverity(level as any)}
                                        className={`p-3 rounded-xl border transition-all text-sm font-bold capitalize ${alertSeverity === level
                                            ? level === 'emergency' ? 'bg-red-500/20 border-red-500 text-red-400'
                                                : level === 'warning' ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                                    : 'bg-purple-500/20 border-purple-500 text-purple-400'
                                            : 'bg-ocean-900/30 border-rain-700 text-rain-400 hover:border-rain-500'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={creating || !selectedIncidentId}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30 hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creating ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Sending Alert...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Broadcast Alert
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
