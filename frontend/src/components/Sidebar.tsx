import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    AlertTriangle,
    Megaphone,
    TrendingUp,
    Brain,
    Settings,
    Users,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
} from 'lucide-react';

interface SidebarProps {
    className?: string;
}

interface NavItem {
    name: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
    requiredRole?: string[];
}

const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Reports', path: '/admin/reports', icon: FileText, badge: '12' },
    { name: 'Incidents', path: '/admin/incidents', icon: AlertTriangle, badge: '3' },
    { name: 'Alerts', path: '/admin/alerts', icon: Megaphone },
    { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
    { name: 'Bots', path: '/admin/bots', icon: MessageSquare },
    { name: 'AI Insights', path: '/admin/ai-insights', icon: Brain, badge: 'NEW' },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Users', path: '/admin/users', icon: Users, requiredRole: ['SUPER_ADMIN'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div
            className={`${isCollapsed ? 'w-20' : 'w-64'
                } glass-strong border-r border-slate-700/30 transition-all duration-300 flex flex-col ${className}`}
        >
            {/* Collapse Toggle */}
            <div className="p-4 flex justify-end">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    ) : (
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    )}
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive
                                ? 'bg-gradient-to-r from-teal-500/20 to-teal-600/10 text-white border-l-4 border-teal-500'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-400'
                                        } transition-colors flex-shrink-0`}
                                />
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 font-semibold">{item.name}</span>
                                        {item.badge && (
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-xs font-bold ${item.badge === 'NEW'
                                                    ? 'bg-teal-500/20 text-teal-400'
                                                    : 'bg-critical-500/20 text-critical-400'
                                                    }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            {!isCollapsed && (
                <div className="p-4 border-t border-slate-700/30">
                    <div className="glass bg-navy-900/30 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-safe-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-safe-400">System Operational</span>
                        </div>
                        <p className="text-xs text-slate-500">Last updated: Just now</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
