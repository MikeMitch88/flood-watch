import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, MapPin, Clock } from 'lucide-react';
import axios from 'axios';

interface Alert {
    id: string;
    severity: string;
    message: string;
    affected_radius_km: number;
    created_at: string;
}

export const UserAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            // Fetch alerts from backend
            const response = await axios.get('http://localhost:8000/api/alerts/');
            setAlerts(response.data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-600 border-red-500';
            case 'high':
                return 'bg-orange-600 border-orange-500';
            case 'medium':
                return 'bg-yellow-600 border-yellow-500';
            default:
                return 'bg-blue-600 border-blue-500';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading alerts...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Alerts</h1>
                <p className="text-slate-400">Stay informed about flood incidents in your area</p>
            </div>

            {alerts.length === 0 ? (
                <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
                    <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Active Alerts</h3>
                    <p className="text-slate-400">There are currently no flood alerts for your area</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`border-l-4 ${getSeverityColor(alert.severity)} bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 ${getSeverityColor(alert.severity)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-white capitalize">{alert.severity} Alert</h3>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Clock className="w-4 h-4" />
                                            {new Date(alert.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                    <p className="text-slate-300 mb-3">{alert.message}</p>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>Affected radius: {alert.affected_radius_km} km</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
