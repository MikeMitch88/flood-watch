import { useEffect, useState } from 'react';
import { incidentsAPI } from '../../api/client';
import { MapPin, AlertCircle, Activity, CheckCircle2, Eye, Filter, Zap, Users, ShieldAlert, Sparkles, MapPinned, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import IncidentMap from '../../components/IncidentMap';
import { Modal } from '../../components/Modal';

interface Incident {
    id: string;
    location: { lat: number; lon: number };
    affected_radius_km: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'monitoring' | 'resolved';
    report_count: number;
    affected_population_estimate?: number;
    created_at: string;
    resolved_at?: string;
}

export default function Incidents() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'monitoring' | 'resolved'>('all');
    const [view, setView] = useState<'grid' | 'map'>('grid');

    useEffect(() => {
        fetchIncidents();
    }, [filter]);

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const params = filter === 'all' ? {} : { status: filter };
            const response = await incidentsAPI.getAll(params);
            setIncidents(response.data);
        } catch (error: any) {
            console.error('Failed to fetch incidents:', error);
            toast.error('Failed to load incidents');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (incidentId: string, newStatus: string) => {
        try {
            await incidentsAPI.updateStatus(incidentId, newStatus);
            toast.success(`Incident status updated to ${newStatus}`);
            fetchIncidents();
            setSelectedIncident(null);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleResolve = async (incidentId: string) => {
        try {
            await incidentsAPI.resolve(incidentId);
            toast.success('Incident marked as resolved');
            fetchIncidents();
            setSelectedIncident(null);
        } catch (error) {
            toast.error('Failed to resolve incident');
        }
    };

    const filteredIncidents = filter === 'all'
        ? incidents
        : incidents.filter(i => i.status === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-ocean-700/30 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-white font-semibold text-lg animate-pulse">Loading Incidents</p>
                        <p className="text-rain-400 text-sm">Fetching active emergencies...</p>
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
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg shadow-orange-500/30">
                            <ShieldAlert className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                                Incidents
                            </h1>
                            <p className="text-rain-400 flex items-center gap-2 mt-1">
                                <Sparkles className="w-4 h-4 text-orange-400" />
                                Monitor and manage emergency incidents
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${view === 'grid' ? 'from-orange-500 to-amber-400' : 'from-aqua-500 to-cyan-400'} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                    <button
                        onClick={() => setView(view === 'grid' ? 'map' : 'grid')}
                        className="relative glass-strong border border-rain-600/30 px-6 py-3 rounded-2xl hover:border-orange-500/50 transition-all flex items-center gap-3 font-bold transform hover:scale-105 duration-300"
                    >
                        {view === 'grid' ? (
                            <>
                                <MapPinned className="w-5 h-5 text-orange-400" />
                                <span className="text-white">Map View</span>
                            </>
                        ) : (
                            <>
                                <Activity className="w-5 h-5 text-aqua-400" />
                                <span className="text-white">Grid View</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Enhanced Filters */}
            <div className="glass-strong rounded-2xl p-6 border border-rain-600/30">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-rain-400 font-semibold mr-2 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter Status:
                    </span>
                    {['all', 'active', 'monitoring', 'resolved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-5 py-2.5 rounded-xl font-bold capitalize transition-all duration-300 transform hover:scale-105 ${filter === f
                                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-ocean-900/50 text-rain-400 hover:bg-ocean-800 hover:text-white border border-rain-700/50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            {view === 'map' ? (
                <div className="glass-strong rounded-2xl p-6 border border-rain-600/30 h-[600px] animate-scale-in">
                    <IncidentMap
                        incidents={filteredIncidents.map(i => ({
                            id: i.id,
                            location: i.location,
                            severity: i.severity,
                            status: i.status
                        }))}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIncidents.map((incident, index) => (
                        <div
                            key={incident.id}
                            className="glass-strong rounded-2xl border border-rain-600/30 overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-lg group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-xl ${incident.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                        incident.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                            incident.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${incident.status === 'active' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                                        incident.status === 'monitoring' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        }`}>
                                        {incident.status}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-rain-400 text-sm">
                                        <MapPin className="w-4 h-4 text-aqua-400" />
                                        <span>Lat: {incident.location.lat.toFixed(4)}, Lon: {incident.location.lon.toFixed(4)}</span>
                                    </div>
                                    <p className="text-sm text-rain-300">
                                        Radius: <span className="text-white font-semibold">{incident.affected_radius_km} km</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-rain-700/50">
                                    <div className="glass bg-ocean-900/40 p-3 rounded-xl">
                                        <div className="text-rain-400 text-xs mb-1">Reports</div>
                                        <div className="text-xl font-bold text-white flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-aqua-400" />
                                            {incident.report_count}
                                        </div>
                                    </div>
                                    <div className="glass bg-ocean-900/40 p-3 rounded-xl">
                                        <div className="text-rain-400 text-xs mb-1">Population</div>
                                        <div className="text-xl font-bold text-white flex items-center gap-2">
                                            <Users className="w-4 h-4 text-orange-400" />
                                            {(incident.affected_population_estimate || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={() => setSelectedIncident(incident)}
                                        className="w-full py-3 rounded-xl bg-ocean-700 hover:bg-aqua-600 text-white font-semibold transition-all flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-aqua-500 group-hover:to-cyan-600"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredIncidents.length === 0 && (
                        <div className="col-span-full text-center py-12 glass-strong rounded-2xl border border-rain-600/30">
                            <div className="flex flex-col items-center gap-4">
                                <Search className="w-12 h-12 text-rain-600" />
                                <h3 className="text-xl font-bold text-rain-300">No Incidents Found</h3>
                                <p className="text-rain-400">No {filter !== 'all' ? filter : ''} incidents match your criteria</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Enhanced Incident Details Modal */}
            {selectedIncident && (
                <Modal isOpen={!!selectedIncident} onClose={() => setSelectedIncident(null)} title="Incident Details">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-4 border-b border-rain-700/50">
                            <div className={`p-4 rounded-2xl ${selectedIncident.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                                selectedIncident.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                                    'bg-blue-500/20 text-blue-500'
                                }`}>
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold font-display text-white">Emergency Incident</h2>
                                <p className="text-rain-400">ID: {selectedIncident.id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass bg-ocean-900/30 p-4 rounded-xl space-y-1">
                                <label className="text-xs font-bold text-rain-400 uppercase tracking-wider">Status</label>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${selectedIncident.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                                        }`}></div>
                                    <span className="text-white font-bold capitalize">{selectedIncident.status}</span>
                                </div>
                            </div>
                            <div className="glass bg-ocean-900/30 p-4 rounded-xl space-y-1">
                                <label className="text-xs font-bold text-rain-400 uppercase tracking-wider">Severity</label>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-orange-400" />
                                    <span className="text-white font-bold capitalize">{selectedIncident.severity}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-aqua-400" />
                                Impact Analysis
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 rounded-xl bg-ocean-800/50 border border-rain-700/30">
                                    <div className="text-2xl font-bold text-white mb-1">{selectedIncident.report_count}</div>
                                    <div className="text-xs text-rain-400 uppercase">Reports</div>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-ocean-800/50 border border-rain-700/30">
                                    <div className="text-2xl font-bold text-white mb-1">{selectedIncident.affected_radius_km}km</div>
                                    <div className="text-xs text-rain-400 uppercase">Radius</div>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-ocean-800/50 border border-rain-700/30">
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {(selectedIncident.affected_population_estimate || 0).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-rain-400 uppercase">Affected</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-rain-700/50 flex gap-4">
                            {selectedIncident.status !== 'resolved' && (
                                <button
                                    onClick={() => handleResolve(selectedIncident.id)}
                                    className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Mark Resolved
                                </button>
                            )}
                            {selectedIncident.status === 'active' && (
                                <button
                                    onClick={() => handleStatusUpdate(selectedIncident.id, 'monitoring')}
                                    className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-5 h-5" />
                                    Monitor
                                </button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
