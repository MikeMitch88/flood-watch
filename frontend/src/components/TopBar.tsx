import React, { useState, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, LogOut, Settings, Moon, Sun, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: number;
    type: 'critical' | 'warning' | 'info';
    message: string;
    time: string;
    read: boolean;
}

interface TopBarProps {
    className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();

    // Load notifications from localStorage or use defaults
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem('admin_notifications');
        if (saved) {
            return JSON.parse(saved);
        }
        return [
            { id: 1, type: 'critical', message: 'New critical incident in Nairobi Region', time: '2m ago', read: false },
            { id: 2, type: 'warning', message: '15 pending reports require verification', time: '10m ago', read: false },
            { id: 3, type: 'info', message: 'System update scheduled for tonight', time: '1h ago', read: false },
            { id: 4, type: 'critical', message: '3 new high-severity reports submitted', time: '2h ago', read: false },
            { id: 5, type: 'warning', message: 'Alert delivery rate below 90%', time: '3h ago', read: false },
        ];
    });

    // Save notifications to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        // Navigate to relevant page based on notification type
        if (notification.type === 'critical') {
            navigate('/admin/incidents');
        } else if (notification.message.includes('reports')) {
            navigate('/admin/reports');
        }
        setShowNotifications(false);
    };

    return (
        <div className={`sticky top-0 z-50 glass-strong border-b border-slate-700/30 ${className}`}>
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-glow-teal">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold font-display text-white">Cloud-Watch</h1>
                                <p className="text-xs text-slate-400">Enterprise Monitoring</p>
                            </div>
                        </div>
                    </div>

                    {/* Global Search */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search reports, incidents, alerts... (⌘K)"
                                className="w-full pl-12 pr-4 py-3 bg-navy-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400">
                                ⌘K
                            </kbd>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Dark/Light Mode Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Toggle theme"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5 text-slate-400 hover:text-teal-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-400 hover:text-teal-400" />
                            )}
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <Bell className="w-5 h-5 text-slate-400 hover:text-teal-400" />
                                {unreadCount > 0 && (
                                    <>
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-critical-500 rounded-full animate-pulse"></span>
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-critical-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    </>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-96 glass-strong rounded-xl border border-slate-600/30 shadow-elevation-lg overflow-hidden animate-slide-in">
                                    <div className="p-4 border-b border-slate-700/50">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-white">Notifications</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400">{unreadCount} unread</span>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`p-4 border-b border-slate-700/30 hover:bg-slate-800/50 cursor-pointer transition-colors ${!notification.read ? 'bg-teal-500/5' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'critical' ? 'bg-critical-500' :
                                                        notification.type === 'warning' ? 'bg-warning-500' :
                                                            'bg-info-500'
                                                        } ${notification.read ? 'opacity-30' : 'animate-pulse'}`}></div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm ${notification.read ? 'text-slate-400' : 'text-slate-200 font-semibold'}`}>
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                                                    </div>
                                                    {notification.read && (
                                                        <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 text-center border-t border-slate-700/50">
                                        <button className="text-sm text-teal-400 hover:text-teal-300 font-semibold">
                                            View All Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-semibold text-white">{user?.email || 'Admin User'}</p>
                                    <p className="text-xs text-slate-400">Administrator</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-56 glass-strong rounded-xl border border-slate-600/30 shadow-elevation-lg overflow-hidden animate-slide-in">
                                    <div className="p-3 border-b border-slate-700/50">
                                        <p className="text-sm font-semibold text-white">{user?.email || 'admin@cloudwatch.io'}</p>
                                        <p className="text-xs text-slate-400 mt-1">Super Administrator</p>
                                    </div>
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                navigate('/admin/settings/profile');
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-3"
                                        >
                                            <User className="w-4 h-4" />
                                            Profile Settings
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/admin/settings/system');
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-3"
                                        >
                                            <Settings className="w-4 h-4" />
                                            System Settings
                                        </button>
                                    </div>
                                    <div className="border-t border-slate-700/50">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-3 text-left text-sm text-critical-400 hover:bg-critical-500/10 transition-colors flex items-center gap-3"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
