import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Clock, MapPin, AlertTriangle, Waves, Menu, X, Info, Shield } from 'lucide-react';

export default function LiveAlerts() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetch('/api/public/incidents')
            .then(res => res.json())
            .then(data => {
                setAlerts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

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
                            <Link to="/map" className="text-soft-grey hover:text-navy-900 font-medium transition-colors">Live Map</Link>
                            <Link to="/alerts" className="text-navy-900 font-semibold">Alerts</Link>
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
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-alert-500/10 rounded-full mb-4">
                            <Bell className="w-4 h-4 text-alert-500" />
                            <span className="text-alert-500 font-semibold text-sm tracking-wide">LIVE ALERTS</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-3 font-display">Active Flood Alerts</h1>
                        <p className="text-soft-grey text-lg">Real-time warnings and safety information for your area</p>
                    </div>

                    {/* Alerts List */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-alert-500/20 border-t-alert-500 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-soft-grey">Loading alerts...</p>
                            </div>
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-white rounded-3xl p-16 inline-block shadow-xl">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                                    <Shield className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-3xl font-bold text-navy-900 mb-3 font-display">All Clear!</h3>
                                <p className="text-soft-grey max-w-sm">No active flood alerts at this time. Stay safe!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {alerts.map((alert) => (
                                <AlertCard key={alert.id} alert={alert} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function AlertCard({ alert }: { alert: any }) {
    const getSeverityColors = (severity: string) => {
        switch (severity) {
            case 'low': return { bg: 'bg-aqua-500', border: 'border-aqua-500' };
            case 'medium': return { bg: 'bg-alert-500', border: 'border-alert-500' };
            case 'high': return { bg: 'bg-orange-500', border: 'border-orange-500' };
            case 'critical': return { bg: 'bg-red-600', border: 'border-red-600' };
            default: return { bg: 'bg-soft-grey', border: 'border-soft-grey' };
        }
    };

    const severityEmoji: Record<string, string> = {
        low: '🌊',
        medium: '⚠️',
        high: '🚨',
        critical: '🆘',
    };

    const colors = getSeverityColors(alert.severity);

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all">
            {/* Alert Header */}
            <div className={`${colors.bg} p-6`}>
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{severityEmoji[alert.severity] || '📢'}</span>
                        <div>
                            <h3 className="text-xl font-bold uppercase tracking-wider">
                                {alert.severity} Alert
                            </h3>
                            <p className="text-sm text-white/90">Active Flood Warning</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Clock className="w-4 h-4" />
                        {new Date(alert.created_at).toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Alert Body */}
            <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                    <MapPin className="w-5 h-5 text-aqua-500 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-navy-900 mb-3 leading-relaxed">
                            {alert.description || `Flooding incident detected with ${alert.report_count} confirmed reports in the area.`}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-soft-grey">
                            <span className="flex items-center gap-1">
                                <Info className="w-4 h-4" />
                                {alert.report_count} reports
                            </span>
                            <span>• Radius: {alert.affected_radius_km} km</span>
                            {alert.estimated_population_affected && (
                                <span>• ~{alert.estimated_population_affected.toLocaleString()} affected</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Safety Instructions */}
                <div className="bg-soft-white rounded-xl p-5 border border-soft-border">
                    <h4 className="text-navy-900 font-bold mb-3 flex items-center gap-2 font-display">
                        <AlertTriangle className="w-5 h-5 text-alert-500" />
                        Safety Actions
                    </h4>
                    <ul className="text-sm text-soft-grey space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-aqua-500 font-bold">•</span>
                            <span>Avoid the affected area if possible</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-aqua-500 font-bold">•</span>
                            <span>Follow evacuation orders from authorities</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-aqua-500 font-bold">•</span>
                            <span>Move to higher ground immediately if instructed</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-aqua-500 font-bold">•</span>
                            <span>Check on elderly or vulnerable neighbors</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
