import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Waves, Menu, X, Filter, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function PublicMap() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

    useEffect(() => {
        fetch('/api/incidents/active')
            .then(res => res.json())
            .then(data => {
                setIncidents(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return '#2BB4D6';
            case 'medium': return '#F5C542';
            case 'high': return '#ea580c';
            case 'critical': return '#dc2626';
            default: return '#6B7A8F';
        }
    };

    const filteredIncidents = selectedSeverity === 'all'
        ? incidents
        : incidents.filter(i => i.severity === selectedSeverity);

    return (
        <div className="min-h-screen bg-soft-white">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-navy-aqua rounded-xl flex items-center justify-center">
                                <Waves className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-navy-900 font-display">Flood Watch</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-soft-grey hover:text-navy-900 font-medium transition-colors">Home</Link>
                            <Link to="/map" className="text-navy-900 font-semibold">Live Map</Link>
                            <Link to="/alerts" className="text-soft-grey hover:text-navy-900 font-medium transition-colors">Alerts</Link>
                            <Link to="/safety" className="text-soft-grey hover:text-navy-900 font-medium transition-colors">Safety</Link>
                            <Link to="/about" className="text-soft-grey hover:text-navy-900 font-medium transition-colors">About</Link>
                        </div>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="section-padding">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-navy-900 mb-2 font-display">Live Flood Map</h1>
                        <p className="text-soft-grey text-lg">Real-time flood incidents across monitored regions</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl p-5 mb-6 shadow-card">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-soft-grey" />
                                <span className="text-sm font-semibold text-navy-900">Filter by severity:</span>
                            </div>
                            {['all', 'low', 'medium', 'high', 'critical'].map((severity) => (
                                <button
                                    key={severity}
                                    onClick={() => setSelectedSeverity(severity)}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${selectedSeverity === severity
                                            ? 'bg-gradient-navy-aqua text-white shadow-lg'
                                            : 'bg-soft-white text-soft-grey hover:text-navy-900 hover:bg-white'
                                        }`}
                                >
                                    {severity}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Map */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-card">
                                <div className="h-[600px]">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full bg-soft-white">
                                            <div className="text-center">
                                                <div className="w-12 h-12 border-4 border-aqua-500/20 border-t-aqua-500 rounded-full animate-spin mx-auto mb-4" />
                                                <p className="text-soft-grey">Loading map...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <MapContainer center={[-1.2921, 36.8219]} zoom={12} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='© OpenStreetMap'
                                            />
                                            {filteredIncidents.map((incident) => (
                                                <div key={incident.id}>
                                                    <Circle
                                                        center={[incident.location?.lat || -1.2921, incident.location?.lon || 36.8219]}
                                                        radius={(incident.affected_radius_km || 1) * 1000}
                                                        pathOptions={{
                                                            color: getSeverityColor(incident.severity),
                                                            fillColor: getSeverityColor(incident.severity),
                                                            fillOpacity: 0.2,
                                                        }}
                                                    />
                                                    <Marker position={[incident.location?.lat || -1.2921, incident.location?.lon || 36.8219]}>
                                                        <Popup>
                                                            <div className="p-2">
                                                                <span className={`severity-${incident.severity}`}>
                                                                    {incident.severity?.toUpperCase()}
                                                                </span>
                                                                <p className="mt-2 font-semibold text-navy-900">{incident.report_count} Reports</p>
                                                                <p className="text-sm text-soft-grey">Radius: {incident.affected_radius_km} km</p>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                </div>
                                            ))}
                                        </MapContainer>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Active Incidents */}
                            <div className="bg-white rounded-2xl p-6 shadow-card">
                                <h3 className="text-xl font-bold text-navy-900 mb-4 font-display flex items-center gap-2">
                                    <Info className="w-5 h-5 text-aqua-500" />
                                    Active Incidents ({filteredIncidents.length})
                                </h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {filteredIncidents.length === 0 ? (
                                        <p className="text-soft-grey text-sm text-center py-8">No incidents match your filter</p>
                                    ) : (
                                        filteredIncidents.slice(0, 10).map((incident) => (
                                            <div key={incident.id} className="bg-soft-white rounded-lg p-4 border border-soft-border hover:border-aqua-500 hover:shadow-md transition-all">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`severity-${incident.severity} text-[10px]`}>
                                                        {incident.severity?.toUpperCase()}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-xs text-soft-grey">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(incident.created_at).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-navy-900 font-medium">
                                                    <MapPin className="w-4 h-4 text-aqua-500" />
                                                    {incident.report_count} reports • {incident.affected_radius_km} km
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="bg-white rounded-2xl p-6 shadow-card">
                                <h3 className="text-xl font-bold text-navy-900 mb-4 font-display">Severity Legend</h3>
                                <div className="space-y-3">
                                    <LegendItem color="#2BB4D6" label="Low" description="Minor flooding" />
                                    <LegendItem color="#F5C542" label="Medium" description="Moderate flooding" />
                                    <LegendItem color="#ea580c" label="High" description="Severe flooding" />
                                    <LegendItem color="#dc2626" label="Critical" description="Dangerous flooding" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LegendItem({ color, label, description }: { color: string; label: string; description: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
            <div>
                <div className="text-navy-900 font-semibold text-sm">{label}</div>
                <div className="text-xs text-soft-grey">{description}</div>
            </div>
        </div>
    );
}
