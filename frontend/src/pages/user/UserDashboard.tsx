import React, { useEffect, useState } from 'react';
import { FileText, AlertTriangle, Bell, TrendingUp, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export const UserDashboard: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        reportsSubmitted: 0,
        alertsReceived: 0,
        verifiedReports: 0,
    });

    useEffect(() => {
        const getUser = async () => {
            const session = localStorage.getItem('supabase_session');
            if (session) {
                const parsed = JSON.parse(session);
                setUser(parsed.user);

                // Fetch user's reports to calculate stats
                try {
                    const response = await fetch(`http://localhost:8000/api/reports/user/${parsed.user.id}`);
                    if (response.ok) {
                        const reports = await response.json();
                        const verifiedCount = reports.filter((r: any) => r.verification_status === 'verified').length;

                        setStats({
                            reportsSubmitted: reports.length,
                            verifiedReports: verifiedCount,
                            alertsReceived: 0, // TODO: Fetch from alerts endpoint
                        });
                    }
                } catch (error) {
                    console.error('Error fetching stats:', error);
                }
            }
        };
        getUser();
    }, []);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 rounded-2xl p-8 border border-teal-500/20">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-slate-300">
                    Help keep your community safe by reporting flood incidents and staying informed.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-teal-400" />
                        </div>
                        <span className="text-3xl font-bold text-white">{stats.reportsSubmitted}</span>
                    </div>
                    <h3 className="text-slate-300 font-medium">Reports Submitted</h3>
                </div>

                <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-3xl font-bold text-white">{stats.verifiedReports}</span>
                    </div>
                    <h3 className="text-slate-300 font-medium">Verified Reports</h3>
                </div>

                <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Bell className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="text-3xl font-bold text-white">{stats.alertsReceived}</span>
                    </div>
                    <h3 className="text-slate-300 font-medium">Alerts Received</h3>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        to="/dashboard/report"
                        className="flex items-center gap-4 p-6 bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors group"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">Report Incident</h3>
                            <p className="text-teal-100 text-sm">Submit a new flood report</p>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/alerts"
                        className="flex items-center gap-4 p-6 bg-navy-800 hover:bg-navy-700 border border-white/10 rounded-xl transition-colors group"
                    >
                        <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Bell className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">View Alerts</h3>
                            <p className="text-slate-400 text-sm">Check alerts for your area</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="text-center py-8 text-slate-400">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm mt-2">Start by reporting an incident or checking alerts in your area</p>
                </div>
            </div>
        </div>
    );
};
