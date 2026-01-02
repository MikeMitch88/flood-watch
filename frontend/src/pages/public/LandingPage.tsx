import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Shield, Bell, Users, MapPin, TrendingUp, ChevronRight, CheckCircle, Activity, Globe } from 'lucide-react';
import { Button } from '../../components/Button';
import { Navbar } from '../../components/Navbar';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-navy-950 font-sans selection:bg-teal-500/30">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
                <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-[1000px] h-[500px] bg-teal-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse-slow animation-delay-500" />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-800/50 border border-teal-500/30 backdrop-blur-sm mb-8 animate-fade-in">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        <span className="text-teal-400 text-sm font-medium tracking-wide">Live Flood Monitoring Active</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-tight animate-slide-in">
                        Save Lives Through <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-teal-400 to-blue-500 text-glow">
                            Early Flood Warnings
                        </span>
                    </h1>

                    <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-in animation-delay-100">
                        Real-time community-driven flood monitoring powered by advanced AI.
                        Receive instant verified alerts and protect your community before disaster strikes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in animation-delay-200">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/signup')}
                            className="w-full sm:w-auto min-w-[180px] bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                        >
                            <span className="mr-2">Join the Network</span>
                            <Users size={18} />
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-full sm:w-auto min-w-[180px] border-slate-700 text-slate-300 hover:bg-white/5"
                            onClick={() => { }} // Added onclick to match types ideally
                        >
                            <span className="mr-2">Watch Demo</span>
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Section - Floating Cards */}
            <section className="relative z-20 -mt-8 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Active Users', value: '12,543', trend: '+23%', icon: Users, color: 'text-teal-400' },
                            { label: 'Reports Verified', value: '8,234', trend: '98% accuracy', icon: CheckCircle, color: 'text-blue-400' },
                            { label: 'Lives Protected', value: '45k+', trend: 'Real-time', icon: Shield, color: 'text-emerald-400' },
                            { label: 'Risk Areas', value: '156', trend: 'Monitored', icon: MapPin, color: 'text-amber-400' },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-slate-300 border border-white/5">
                                        {stat.trend}
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-white mb-1 tracking-tight">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 relative bg-navy-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            Why <span className="text-teal-400">Flood Watch?</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Enterprise-grade technology meets community collaboration for the most reliable early warning system.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Bell,
                                title: 'Real-Time Alerts',
                                description: 'Instant multi-channel notifications via SMS, WhatsApp, and Telegram when danger is detected.',
                                gradient: 'from-pink-500 to-rose-500'
                            },
                            {
                                icon: Activity,
                                title: 'AI Verification',
                                description: 'Advanced ML algorithms validate reports in seconds to ensure accuracy and prevent panic.',
                                gradient: 'from-teal-400 to-emerald-500'
                            },
                            {
                                icon: Globe,
                                title: 'Geofenced Zones',
                                description: 'Precise location-based warnings ensure you only get alerts relevant to your safety.',
                                gradient: 'from-blue-400 to-indigo-500'
                            },
                            {
                                icon: Users,
                                title: 'Crowdsourced Data',
                                description: 'Mobilize thousands of citizen observers to create a dense, real-time ground truth network.',
                                gradient: 'from-amber-400 to-orange-500'
                            },
                            {
                                icon: Droplets, // Replaced Globe with Droplets for variety if preferred, or keep icons unique
                                title: 'No App Required',
                                description: 'Report and receive alerts through apps you already use like WhatsApp. Low friction, high coverage.',
                                gradient: 'from-cyan-400 to-blue-500'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Predictive Analytics',
                                description: 'Historical data analysis and trend forecasting to prepare for future flood events.',
                                gradient: 'from-purple-400 to-violet-500'
                            },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="group relative p-8 rounded-3xl bg-navy-800/30 border border-white/5 hover:bg-navy-800/50 transition-all duration-300 overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${feature.gradient} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />

                                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="text-white" size={24} />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Steps */}
            <section id="how-it-works" className="py-24 bg-navy-950 relative overflow-hidden">
                <div className="absolute left-0 top-1/2 w-96 h-96 bg-teal-900/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            How It Works
                        </h2>
                    </div>

                    <div className="grid gap-12 max-w-4xl mx-auto">
                        {[
                            { step: '01', title: 'Report', desc: 'Citizens send location & photo via WhatsApp, Telegram, or App.' },
                            { step: '02', title: 'Verify', desc: 'AI verifies image & location against weather data & satellite imagery.' },
                            { step: '03', title: 'Alert', desc: 'Warning issued to all users in the specific geofenced risk zone.' },
                            { step: '04', title: 'Act', desc: 'Authorities and communities mobilize for evacuation and relief.' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-8 group">
                                <div className="hidden md:block w-24 h-px bg-slate-800 group-hover:bg-teal-500/50 transition-colors" />
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-navy-800 border border-slate-700 flex items-center justify-center text-2xl font-bold text-slate-500 group-hover:text-teal-400 group-hover:border-teal-500/50 transition-all">
                                    {item.step}
                                </div>
                                <div className="flex-1 p-6 rounded-2xl border border-transparent group-hover:bg-navy-900/50 group-hover:border-slate-800 transition-all">
                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative text-center px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950 to-teal-900/20" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                        Ready to make a difference?
                    </h2>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Join the network of thousands ensuring their communities stay safe from floods.
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/signup')}
                        className="px-8 py-4 text-lg bg-white text-teal-700 hover:bg-slate-100 hover:text-teal-800 shadow-xl shadow-white/5"
                    >
                        Get Started Free
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-navy-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Droplets className="text-teal-500" size={24} />
                        <span className="text-lg font-bold text-slate-200">Flood Watch</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        © 2025 Flood Watch. Saving lives through technology.
                    </div>
                </div>
            </footer>
        </div>
    );
};
