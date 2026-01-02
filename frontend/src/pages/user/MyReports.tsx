import React, { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, MapPin, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Report {
    id: string;
    location: { lat: number; lon: number };
    address?: string;
    severity: string;
    description: string;
    verification_status: string;
    created_at: string;
}

export const MyReports: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const session = localStorage.getItem('supabase_session');
            const user = session ? JSON.parse(session).user : null;

            if (!user) {
                toast.error('Please login to view your reports');
                return;
            }

            // Fetch reports from backend using user-specific endpoint
            const response = await axios.get(`http://localhost:8000/api/reports/user/${user.id}`);
            setReports(response.data);
        } catch (error: any) {
            console.error('Error fetching reports:', error);
            // If endpoint doesn't support filtering by user_id, just show empty state
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-400" />;
            default:
                return <Clock className="w-5 h-5 text-yellow-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'rejected':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-600';
            case 'high':
                return 'bg-orange-600';
            case 'medium':
                return 'bg-yellow-600';
            default:
                return 'bg-blue-600';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading your reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">My Reports</h1>
                <p className="text-slate-400">Track the status of your submitted flood reports</p>
            </div>

            {reports.length === 0 ? (
                <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Reports Yet</h3>
                    <p className="text-slate-400 mb-6">You haven't submitted any flood reports</p>
                    <a
                        href="/dashboard/report"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        Report an Incident
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-navy-800/50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`w-12 h-12 ${getSeverityColor(report.severity)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-white capitalize">{report.severity} Severity</h3>
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(report.verification_status)}`}>
                                                {getStatusIcon(report.verification_status)}
                                                <span className="text-sm font-medium capitalize">{report.verification_status}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                                            <MapPin className="w-4 h-4" />
                                            <span>{report.address || `${report.location.lat.toFixed(4)}, ${report.location.lon.toFixed(4)}`}</span>
                                        </div>
                                        <p className="text-slate-300">{report.description}</p>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-slate-400">
                                    {new Date(report.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
