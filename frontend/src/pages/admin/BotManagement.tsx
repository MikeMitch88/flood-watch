import React, { useEffect, useState } from 'react';
import { MessageSquare, Activity, Users, CheckCircle, XCircle, AlertCircle, Settings as SettingsIcon, Zap, TrendingUp } from 'lucide-react';
import { botService, BotStatus, BotMetrics } from '../../services/botService';
import toast from 'react-hot-toast';

export default function BotManagement() {
    const [botStatus, setBotStatus] = useState<BotStatus[]>([]);
    const [botMetrics, setBotMetrics] = useState<BotMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState<{ whatsapp: boolean; telegram: boolean }>({
        whatsapp: false,
        telegram: false
    });

    useEffect(() => {
        loadBotData();
        // Refresh every 30 seconds
        const interval = setInterval(loadBotData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadBotData = async () => {
        try {
            const [status, metrics] = await Promise.all([
                botService.getBotStatus(),
                botService.getBotMetrics()
            ]);
            setBotStatus(status);
            setBotMetrics(metrics);
        } catch (error) {
            console.error('Error loading bot data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async (platform: 'whatsapp' | 'telegram') => {
        setTesting({ ...testing, [platform]: true });
        try {
            const success = await botService.testConnection(platform);
            if (success) {
                toast.success(`${platform === 'whatsapp' ? 'WhatsApp' : 'Telegram'} connection successful!`);
            } else {
                toast.error(`${platform === 'whatsapp' ? 'WhatsApp' : 'Telegram'} connection failed`);
            }
        } catch (error) {
            toast.error('Connection test failed');
        } finally {
            setTesting({ ...testing, [platform]: false });
        }
    };

    const getStatusIcon = (status: BotStatus) => {
        if (!status.configured) return <AlertCircle className="w-6 h-6 text-slate-500" />;
        if (status.connected) return <CheckCircle className="w-6 h-6 text-green-500" />;
        return <XCircle className="w-6 h-6 text-red-500" />;
    };

    const getStatusText = (status: BotStatus) => {
        if (!status.configured) return 'Not Configured';
        if (status.connected) return 'Connected';
        return 'Disconnected';
    };

    const getStatusColor = (status: BotStatus) => {
        if (!status.configured) return 'text-slate-500';
        if (status.connected) return 'text-green-500';
        return 'text-red-500';
    };

    const whatsappStatus = botStatus.find(s => s.platform === 'whatsapp');
    const telegramStatus = botStatus.find(s => s.platform === 'telegram');
    const whatsappMetrics = botMetrics.find(m => m.platform === 'whatsapp');
    const telegramMetrics = botMetrics.find(m => m.platform === 'telegram');

    const totalActiveSessions = botMetrics.reduce((sum, m) => sum + m.activeSessions, 0);
    const totalMessagesProcessed = botMetrics.reduce((sum, m) => sum + m.messagesProcessed, 0);
    const totalReportsSubmitted = botMetrics.reduce((sum, m) => sum + m.reportsSubmitted, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading bot data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Bot Management</h1>
                    <p className="text-slate-400">Monitor and manage WhatsApp and Telegram bots</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-bold">Automated Reporting</span>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-strong rounded-xl p-6 border border-slate-700/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-slate-400 text-sm mb-1">Active Sessions</h3>
                    <p className="text-3xl font-bold text-white">{totalActiveSessions}</p>
                </div>

                <div className="glass-strong rounded-xl p-6 border border-slate-700/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-slate-400 text-sm mb-1">Messages Today</h3>
                    <p className="text-3xl font-bold text-white">{totalMessagesProcessed}</p>
                </div>

                <div className="glass-strong rounded-xl p-6 border border-slate-700/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-slate-400 text-sm mb-1">Reports Submitted</h3>
                    <p className="text-3xl font-bold text-white">{totalReportsSubmitted}</p>
                </div>
            </div>

            {/* Bot Status Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* WhatsApp Bot */}
                <div className="glass-strong rounded-xl border border-slate-700/30 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-b border-slate-700/30">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">WhatsApp Bot</h3>
                                    <p className="text-sm text-slate-400">Business API Integration</p>
                                </div>
                            </div>
                            {whatsappStatus && (
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(whatsappStatus)}
                                    <span className={`font-bold ${getStatusColor(whatsappStatus)}`}>
                                        {getStatusText(whatsappStatus)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        {whatsappMetrics && (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-ocean-900/30 rounded-lg">
                                    <p className="text-slate-400 text-sm mb-1">Active Sessions</p>
                                    <p className="text-2xl font-bold text-white">{whatsappMetrics.activeSessions}</p>
                                </div>
                                <div className="p-4 bg-ocean-900/30 rounded-lg">
                                    <p className="text-slate-400 text-sm mb-1">Messages</p>
                                    <p className="text-2xl font-bold text-white">{whatsappMetrics.messagesProcessed}</p>
                                </div>
                                <div className="p-4 bg-ocean-900/30 rounded-lg">
                                    <p className="text-slate-400 text-sm mb-1">Reports</p>
                                    <p className="text-2xl font-bold text-white">{whatsappMetrics.reportsSubmitted}</p>
                                </div>
                                <div className="p-4 bg-ocean-900/30 rounded-lg">
                                    <p className="text-slate-400 text-sm mb-1">Avg Response</p>
                                    <p className="text-2xl font-bold text-white">{whatsappMetrics.averageResponseTime}s</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleTestConnection('whatsapp')}
                                disabled={testing.whatsapp}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {testing.whatsapp ? 'Testing...' : 'Test Connection'}
                            </button>
                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors">
                                <SettingsIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Telegram Bot */}
                <div className="glass-strong rounded-xl border border-slate-700/30 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border-b border-slate-700/30">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Telegram Bot</h3>
                                    <p className="text-sm text-slate-400">Bot API Integration</p>
                                </div>
                            </div>
                            {telegramStatus && (
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(telegramStatus)}
                                    <span className={`font-bold ${getStatusColor(telegramStatus)}`}>
                                        {getStatusText(telegramStatus)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        {telegramMetrics && (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-ocean-900/30 rounded-lg">
                                    <p className="text-slate-400 text-sm mb-1">Active Sessions</p>
                                    <p className="text-2xl font-bold text-white">{telegramMetrics.activeSessions}</p>
                                </div>
                                <div className="p-4 bg-ocean-900/30 rounded-lg">
                                    <p className="text-slate-400 text-sm mb-1">Messages</p>
                                    <p className="text-2xl font-bold text-white">{telegramMetrics.messagesProcessed}</p>
                                </div>
                                <div className="p-4 bg-ocean-900/30 rounded-lg">
                                    <p className="text-slate-400 text-sm mb-1">Reports</p>
                                    <p className="text-2xl font-bold text-white">{telegramMetrics.reportsSubmitted}</p>
                                </div>
                                <div className="p-4 bg-ocean-900/30 rounded-lg">
                                    <p className="text-slate-400 text-sm mb-1">Avg Response</p>
                                    <p className="text-2xl font-bold text-white">{telegramMetrics.averageResponseTime}s</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleTestConnection('telegram')}
                                disabled={testing.telegram}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {testing.telegram ? 'Testing...' : 'Test Connection'}
                            </button>
                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors">
                                <SettingsIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bot Commands Reference */}
            <div className="glass-strong rounded-xl p-6 border border-slate-700/30">
                <h3 className="text-xl font-bold text-white mb-4">Available Bot Commands</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { cmd: '/start', desc: 'Start or restart bot' },
                        { cmd: '/report', desc: 'Report flooding' },
                        { cmd: '/alerts', desc: 'Subscribe to alerts' },
                        { cmd: '/status', desc: 'Check flood status' },
                        { cmd: '/safety', desc: 'Safety information' },
                        { cmd: '/help', desc: 'Show help menu' },
                        { cmd: '/language', desc: 'Change language' },
                    ].map((command) => (
                        <div key={command.cmd} className="p-3 bg-ocean-900/30 rounded-lg">
                            <code className="text-teal-400 font-bold">{command.cmd}</code>
                            <p className="text-sm text-slate-400 mt-1">{command.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
