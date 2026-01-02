import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Droplets, Home, FileText, AlertTriangle, Bell, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const UserDashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem('supabase_session');
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed');
        }
    };

    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Home' },
        { path: '/dashboard/report', icon: FileText, label: 'Report Incident' },
        { path: '/dashboard/my-reports', icon: AlertTriangle, label: 'My Reports' },
        { path: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
        { path: '/dashboard/profile', icon: User, label: 'Profile' },
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-navy-950 font-sans">
            {/* Top Navbar */}
            <nav className="bg-navy-900/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/50">
                                <Droplets className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white hidden sm:block">Flood Watch</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive(item.path)
                                        ? 'bg-teal-600 text-white'
                                        : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-navy-800 rounded-lg transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-navy-900/95 backdrop-blur-sm border-t border-white/10 z-50">
                <div className="flex items-center justify-around px-2 py-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${isActive(item.path)
                                ? 'text-teal-400'
                                : 'text-slate-400'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
                <Outlet />
            </main>
        </div>
    );
};
