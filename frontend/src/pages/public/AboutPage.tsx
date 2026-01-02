import { Link } from 'react-router-dom';
import { Shield, Users, Zap, Target } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-navy-950 text-slate-200 font-sans selection:bg-teal-500/30">
            <Navbar />

            {/* Mission Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-navy-900 to-navy-950 opacity-50" />
                <div className="absolute top-20 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />

                <div className="relative max-w-4xl mx-auto text-center px-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur rounded-full mb-6 border border-white/10">
                        <Target className="w-4 h-4 text-teal-400" />
                        <span className="text-sm font-semibold tracking-wide text-teal-400">OUR MISSION</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display leading-tight text-white">
                        Protecting Communities<br />Through Technology
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Flood Watch is a community-powered platform that combines real-time crowd-sourced reporting
                        with AI verification to provide early flood warnings and protect vulnerable communities.
                    </p>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-navy-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Users}
                            title="Community Driven"
                            description="Citizens report flooding via WhatsApp and Telegram, creating a dense network of real-time data."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="AI-Verified"
                            description="Advanced algorithms analyze reports, images, and weather data to verify incidents instantly."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Instant Alerts"
                            description="Geo-targeted alerts reach affected communities in seconds via multiple channels."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-navy-950">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center font-display">How It Works</h2>
                    <div className="space-y-6">
                        {[
                            {
                                step: '01',
                                title: 'Citizens Report',
                                description: 'Community members send flood reports with photos and location via messaging apps',
                            },
                            {
                                step: '02',
                                title: 'AI Verification',
                                description: 'Machine learning models analyze images, weather patterns, and historical data',
                            },
                            {
                                step: '03',
                                title: 'Alert Distribution',
                                description: 'Verified incidents trigger automated alerts to affected populations',
                            },
                            {
                                step: '04',
                                title: 'Continuous Monitoring',
                                description: 'Real-time updates track flood evolution and help coordinate response efforts',
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-6 bg-navy-900/50 p-8 rounded-2xl border border-white/5 hover:border-teal-500/20 transition-all">
                                <div className="text-teal-400 font-bold text-lg pt-1">
                                    {item.step}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                                    <p className="text-slate-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Stats */}
            <section className="py-20 bg-navy-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <ImpactStat number="15K+" label="Users" />
                        <ImpactStat number="1.2K" label="Reports" />
                        <ImpactStat number="8.5K" label="Alerts Sent" />
                        <ImpactStat number="99.8%" label="Accuracy" />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-900/20 to-blue-900/20" />
                <div className="relative max-w-4xl mx-auto text-center px-6">
                    <h3 className="text-3xl font-bold mb-4 font-display text-white">Join Our Community</h3>
                    <p className="text-xl text-slate-300 mb-10">Help protect your community by reporting floods and receiving alerts</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/map"
                            className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 shadow-lg shadow-teal-900/20 transition-all"
                        >
                            View Live Map
                        </Link>
                        <Link
                            to="/alerts"
                            className="px-8 py-4 bg-white/5 backdrop-blur border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
                        >
                            Active Alerts
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: any) {
    return (
        <div className="glass-card p-8 rounded-2xl">
            <div className="w-14 h-14 bg-navy-800 rounded-xl flex items-center justify-center mb-6 border border-white/10">
                <Icon className="w-7 h-7 text-teal-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-3 font-display">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}

function ImpactStat({ number, label }: any) {
    return (
        <div className="glass-card p-8 text-center rounded-2xl">
            <div className="text-4xl font-bold text-white mb-2">
                {number}
            </div>
            <div className="text-teal-400 text-sm font-semibold uppercase tracking-wider">{label}</div>
        </div>
    );
}
