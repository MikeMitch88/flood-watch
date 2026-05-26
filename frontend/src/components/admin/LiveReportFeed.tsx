import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertTriangle, CheckCircle, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface SmsReport {
  id: string;
  phone_number: string;
  message_body: string;
  extracted_location: string;
  status: 'pending' | 'clustered' | 'verified' | 'dismissed';
  timestamp: string;
  is_warden: boolean;
}

interface Incident {
  id: string;
  location: string;
  severity: string;
  source: string;
  status: string;
  report_count: number;
}

export default function LiveReportFeed() {
    const [reports, setReports] = useState<SmsReport[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);

    useEffect(() => {
        // In a real implementation, this would connect to a WebSocket/Pusher channel
        // For now, we'll use mock data and a polling interval
        
        setReports([
            {
                id: '1',
                phone_number: '+254712345678',
                message_body: 'Water level rising rapidly near the primary school in Kibera.',
                extracted_location: 'Kibera',
                status: 'pending',
                timestamp: new Date().toISOString(),
                is_warden: false
            },
            {
                id: '2',
                phone_number: '+254799887766',
                message_body: 'URGENT: River Nyando has burst its banks. Need evacuation assistance.',
                extracted_location: 'Nyando',
                status: 'verified',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                is_warden: true
            }
        ]);

        setIncidents([
            {
                id: 'inc1',
                location: 'Nyando',
                severity: 'high',
                source: 'warden',
                status: 'active',
                report_count: 1
            },
            {
                id: 'inc2',
                location: 'Mathare',
                severity: 'medium',
                source: 'public_cluster',
                status: 'active',
                report_count: 6
            }
        ]);
    }, []);

    const handleVerify = (reportId: string) => {
        // In a real app, this would call the backend to update status and create an incident
        setReports(reports.map(r => r.id === reportId ? { ...r, status: 'verified' } : r));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Incoming SMS Stream */}
            <div className="glass-strong rounded-xl border border-slate-700/30 overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 bg-navy-900 border-b border-slate-700/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        <h2 className="font-bold text-white">Live SMS Stream</h2>
                    </div>
                    <span className="flex items-center gap-2 text-xs font-bold px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Listening
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {reports.map(report => (
                        <div 
                            key={report.id} 
                            className={`p-4 rounded-xl border ${report.is_warden ? 'bg-amber-900/20 border-amber-500/30' : 'bg-navy-800/50 border-slate-700/50'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm text-slate-300">{report.phone_number}</span>
                                    {report.is_warden && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                                            <ShieldCheck className="w-3 h-3" /> Warden
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Just now
                                </span>
                            </div>
                            
                            <p className="text-white text-sm mb-3">{report.message_body}</p>
                            
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {report.extracted_location && (
                                        <span className="flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                                            <MapPin className="w-3 h-3" /> {report.extracted_location}
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        report.status === 'pending' ? 'bg-slate-700 text-slate-300' :
                                        report.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                                        'bg-purple-500/20 text-purple-400'
                                    }`}>
                                        {report.status.toUpperCase()}
                                    </span>
                                </div>
                                
                                {report.status === 'pending' && (
                                    <button 
                                        onClick={() => handleVerify(report.id)}
                                        className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
                                    >
                                        Verify
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Active Incidents */}
            <div className="glass-strong rounded-xl border border-slate-700/30 overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 bg-navy-900 border-b border-slate-700/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h2 className="font-bold text-white">Active Incidents</h2>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {incidents.map(incident => (
                        <div key={incident.id} className="p-4 rounded-xl bg-navy-800/50 border border-slate-700/50 relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                incident.severity === 'critical' ? 'bg-red-500' :
                                incident.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}></div>
                            
                            <div className="pl-3">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white text-lg">{incident.location} Flooding</h3>
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                        <CheckCircle className="w-3 h-3" /> {incident.status.toUpperCase()}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm mt-3">
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-xs">Source</span>
                                        <span className="text-slate-300 capitalize">{incident.source.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-xs">Severity</span>
                                        <span className={`capitalize ${
                                            incident.severity === 'critical' ? 'text-red-400' :
                                            incident.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                                        }`}>{incident.severity}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-xs">Reports</span>
                                        <span className="text-slate-300">{incident.report_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
