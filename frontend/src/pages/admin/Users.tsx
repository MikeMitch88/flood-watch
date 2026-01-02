import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, Search, UserCheck, UserX, Shield, Mail, Phone } from 'lucide-react';
import axios from 'axios';

interface User {
    id: string;
    phone_number: string;
    platform: string;
    language_code: string;
    alert_subscribed: boolean;
    credibility_score: number;
    created_at: string;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users/');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Users Management</h1>
                    <p className="text-slate-400">Manage platform users and their permissions</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-500/30 rounded-lg">
                    <UsersIcon className="w-5 h-5 text-teal-400" />
                    <span className="text-teal-400 font-bold">{users.length} Total Users</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by phone number or user ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-navy-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
            </div>

            {/* Users Table */}
            <div className="glass-strong rounded-xl border border-slate-700/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50 bg-navy-900/50">
                                <th className="text-left py-4 px-6 text-slate-400 font-bold text-sm uppercase">User</th>
                                <th className="text-left py-4 px-6 text-slate-400 font-bold text-sm uppercase">Platform</th>
                                <th className="text-left py-4 px-6 text-slate-400 font-bold text-sm uppercase">Alerts</th>
                                <th className="text-left py-4 px-6 text-slate-400 font-bold text-sm uppercase">Credibility</th>
                                <th className="text-left py-4 px-6 text-slate-400 font-bold text-sm uppercase">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                                                <UsersIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold">{user.phone_number}</p>
                                                <p className="text-xs text-slate-500 font-mono">{user.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="px-3 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-sm font-medium capitalize">
                                            {user.platform}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {user.alert_subscribed ? (
                                            <div className="flex items-center gap-2 text-green-400">
                                                <UserCheck className="w-4 h-4" />
                                                <span className="text-sm font-medium">Subscribed</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <UserX className="w-4 h-4" />
                                                <span className="text-sm font-medium">Not subscribed</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-400"
                                                    style={{ width: `${user.credibility_score}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-white">{user.credibility_score}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-slate-400 text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-12 text-center">
                        <UsersIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
