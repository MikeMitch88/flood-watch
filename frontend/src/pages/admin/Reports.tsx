import { useEffect, useState } from 'react';
import { reportsAPI } from '../../api/client';
import { MapPin, Filter, CheckCircle, XCircle, Clock, Eye, MapPinned, AlertTriangle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import IncidentMap from '../../components/IncidentMap';
import { Modal } from '../../components/Modal';

interface Report {
    id: string;
    user_id: string;
    location: { lat: number; lon: number };
    address: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    water_depth_cm: number;
    image_urls: string[];
    verification_status: 'pending' | 'verified' | 'rejected' | 'flagged';
    created_at: string;
    verified_at?: string;
    ai_confidence_score?: number;
    community_verifications: number;
}

export default function Reports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
    const [view, setView] = useState<'table' | 'map'>('table'); // New state for view toggle

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const endpoint = filter === 'pending' ? reportsAPI.getPending() : reportsAPI.getAll();
            const response = await endpoint;
            setReports(response.data);
        } catch (error: any) {
            console.error('Failed to fetch reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (reportId: string) => {
        try {
            await reportsAPI.verify(reportId);
            toast.success('Report verified successfully');
            fetchReports();
            setSelectedReport(null);
        } catch (error) {
            toast.error('Failed to verify report');
        }
    };

    const handleReject = async (reportId: string) => {
        const reason = prompt('Enter rejection reason (optional):');
        try {
            await reportsAPI.reject(reportId, reason || 'Insufficient evidence');
            toast.success('Report rejected');
            fetchReports();
            setSelectedReport(null);
        } catch (error) {
            toast.error('Failed to reject report');
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'flagged': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            default: return <Clock className="w-4 h-4 text-blue-400" />;
        }
    };

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.verification_status === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-aqua-500/20 border-t-aqua-500 rounded-full animate-spin"></div>
                    <p className="text-rain-400 animate-pulse">Loading reports...</p>
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
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-mint-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                            <AlertTriangle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                                Reports
                            </h1>
                            <p className="text-rain-400 flex items-center gap-2 mt-1">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                Manage flood reports and verification
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${view === 'table' ? 'from-emerald-500 to-mint-400' : 'from-aqua-500 to-cyan-400'} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                    <button
                        onClick={() => setView(view === 'table' ? 'map' : 'table')}
                        className="relative glass-strong border border-rain-600/30 px-6 py-3 rounded-2xl hover:border-aqua-500/50 transition-all flex items-center gap-3 font-bold transform hover:scale-105 duration-300"
                    >
                        {view === 'table' ? (
                            <>
                                <MapPinned className="w-5 h-5 text-emerald-400" />
                                <span className="text-white">Map View</span>
                            </>
                        ) : (
                            <>
                                <Filter className="w-5 h-5 text-aqua-400" />
                                <span className="text-white">Table View</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            {/* Filters */}
            <div className="glass-strong rounded-2xl p-4 border border-rain-600/30">
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-aqua-400" />
                    <span className="text-white font-semibold">Filter:</span>
                    {['all', 'pending', 'verified', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-xl font-semibold capitalize transition-all ${filter === f
                                ? 'bg-aqua-500 text-white'
                                : 'bg-rain-800/50 text-rain-300 hover:bg-rain-700/50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map View */}
            {view === 'map' && (
                <div className="glass-strong rounded-2xl p-6 border border-rain-600/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-display">
                        <MapPin className="w-5 h-5 text-aqua-400" />
                        Report Locations
                    </h3>
                    <div className="h-[400px] rounded-xl overflow-hidden">
                        <IncidentMap
                            incidents={filteredReports.map(r => ({
                                id: r.id,
                                location: r.location,
                                severity: r.severity,
                                status: 'active',
                                report_count: 1,
                                created_at: r.created_at,
                                affected_radius_km: 1
                            }))}
                        />
                    </div>
                </div>
            )}

            {/* Reports Table */}
            <div className="glass-strong rounded-2xl p-6 border border-rain-600/30">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-rain-600/50">
                                <th className="text-left py-3 px-4 text-rain-400 font-semibold text-sm">Status</th>
                                <th className="text-left py-3 px-4 text-rain-400 font-semibold text-sm">Severity</th>
                                <th className="text-left py-3 px-4 text-rain-400 font-semibold text-sm">Location</th>
                                <th className="text-left py-3 px-4 text-rain-400 font-semibold text-sm">Description</th>
                                <th className="text-left py-3 px-4 text-rain-400 font-semibold text-sm">Water Depth</th>
                                <th className="text-left py-3 px-4 text-rain-400 font-semibold text-sm">Created</th>
                                <th className="text-left py-3 px-4 text-rain-400 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="border-b border-ocean-800 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(report.verification_status)}
                                            <span className="text-white capitalize">{report.verification_status}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getSeverityColor(report.severity)}`}>
                                            {report.severity}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-rain-300 max-w-xs truncate">
                                        {report.address || `${report.location.lat.toFixed(4)}, ${report.location.lon.toFixed(4)}`}
                                    </td>
                                    <td className="py-4 px-4 text-rain-300 max-w-xs truncate">
                                        {report.description || 'No description'}
                                    </td>
                                    <td className="py-4 px-4 text-white font-semibold">
                                        {report.water_depth_cm ? `${report.water_depth_cm} cm` : 'N/A'}
                                    </td>
                                    <td className="py-4 px-4 text-rain-400 text-sm">
                                        {new Date(report.created_at).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-4">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="text-aqua-400 hover:text-aqua-300 font-semibold transition-colors inline-flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredReports.length === 0 && (
                        <div className="text-center py-12 text-rain-400">
                            No {filter !== 'all' ? filter : ''} reports found
                        </div>
                    )}
                </div>
            </div>

            {/* Report Details Modal */}
            {selectedReport && (
                <Modal isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} title="Report Details">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2 font-display">Report Details</h2>
                            <p className="text-rain-400">Review and take action on this report</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-rain-400 text-sm">Status</label>
                                <div className="flex items-center gap-2 mt-1">
                                    {getStatusIcon(selectedReport.verification_status)}
                                    <span className="text-white capitalize">{selectedReport.verification_status}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-rain-400 text-sm">Severity</label>
                                <div className="mt-1">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getSeverityColor(selectedReport.severity)}`}>
                                        {selectedReport.severity}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-rain-400 text-sm">Water Depth</label>
                                <p className="text-white mt-1">{selectedReport.water_depth_cm ? `${selectedReport.water_depth_cm} cm` : 'Not reported'}</p>
                            </div>
                            <div>
                                <label className="text-rain-400 text-sm">Created</label>
                                <p className="text-white mt-1">{new Date(selectedReport.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-rain-400 text-sm">Location</label>
                            <p className="text-white mt-1">{selectedReport.address || 'No address provided'}</p>
                            <p className="text-rain-400 text-sm mt-1">
                                {selectedReport.location.lat.toFixed(6)}, {selectedReport.location.lon.toFixed(6)}
                            </p>
                        </div>

                        <div>
                            <label className="text-rain-400 text-sm">Description</label>
                            <p className="text-white mt-1">{selectedReport.description || 'No description provided'}</p>
                        </div>

                        {selectedReport.ai_confidence_score && (
                            <div>
                                <label className="text-rain-400 text-sm">AI Confidence Score</label>
                                <p className="text-white mt-1">{(selectedReport.ai_confidence_score * 100).toFixed(1)}%</p>
                            </div>
                        )}

                        {selectedReport.verification_status === 'pending' && (
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => handleVerify(selectedReport.id)}
                                    className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Verify Report
                                </button>
                                <button
                                    onClick={() => handleReject(selectedReport.id)}
                                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Reject Report
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
