import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
    LayoutDashboard,
    FileText,
    AlertCircle,
    Bell,
    BarChart3,
    LogOut,
    Menu,
    X,
    Waves,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Reports', href: '/admin/reports', icon: FileText },
        { name: 'Incidents', href: '/admin/incidents', icon: AlertCircle },
        { name: 'Alerts', href: '/admin/alerts', icon: Bell },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ];

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-ocean-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-strong border-r border-white/10 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-xl">
                                    <Waves className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <span className="text-xl font-bold gradient-text">Flood Watch</span>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Zap className="w-3 h-3" />
                                    <span>Admin Panel</span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.href)
                                        ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-white/10">
                        <div className="glass rounded-xl p-4 mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium truncate">{user?.email}</div>
                                    <div className="text-xs text-gray-400">Administrator</div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 glass-strong rounded-xl"
            >
                {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>

            {/* Main Content */}
            <main className="lg:ml-64">
                <Outlet />
            </main>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}
