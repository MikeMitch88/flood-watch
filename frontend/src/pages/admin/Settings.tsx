import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Settings as SettingsIcon, User, Sliders, Bell, Shield } from 'lucide-react';

export default function Settings() {
    const settingsSections = [
        { name: 'Profile Settings', path: '/admin/settings/profile', icon: User },
        { name: 'System Settings', path: '/admin/settings/system', icon: Sliders },
        { name: 'Notifications', path: '/admin/settings/notifications', icon: Bell },
        { name: 'Security', path: '/admin/settings/security', icon: Shield },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-slate-400">Manage your account and system preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="glass-strong rounded-xl border border-slate-700/30 p-4">
                        <nav className="space-y-2">
                            {settingsSections.map((section) => (
                                <NavLink
                                    key={section.path}
                                    to={section.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-teal-500/20 text-teal-400 border-l-4 border-teal-500'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`
                                    }
                                >
                                    <section.icon className="w-5 h-5" />
                                    <span className="font-semibold">{section.name}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
