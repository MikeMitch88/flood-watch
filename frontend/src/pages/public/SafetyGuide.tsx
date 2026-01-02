import { Link } from 'react-router-dom';
import { AlertTriangle, Phone, Users, Droplets, Waves, Menu, X, Shield, Home } from 'lucide-react';
import { useState } from 'react';

export default function SafetyGuide() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-soft-white">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-navy-aqua rounded-xl flex items-center justify-center">
                                <Waves className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-navy-900 font-display">Flood Watch</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-soft-grey hover:text-navy-900 font-medium transition-colors">Home</Link>
                            <Link to="/map" className="text-soft-grey hover:text-navy-900 font-medium transition-colors">Live Map</Link>
                            <Link to="/alerts" className="text-soft-grey hover:text-navy-900 font-medium transition-colors">Alerts</Link>
                            <Link to="/safety" className="text-navy-900 font-semibold">Safety</Link>
                            <Link to="/about" className="text-soft-grey hover:text-navy-900 font-medium transition-colors">About</Link>
                        </div>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="section-padding">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full mb-4">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold text-sm tracking-wide">SAFETY GUIDE</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-3 font-display">Flood Safety Guide</h1>
                        <p className="text-soft-grey text-lg">Essential information to protect you and your family</p>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl p-8 mb-8 shadow-xl text-white">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 font-display">
                            <Phone className="w-6 h-6" />
                            Emergency Contacts
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                                <p className="text-white/80 text-sm mb-1">Emergency Services</p>
                                <p className="text-3xl font-bold">999 / 112</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                                <p className="text-white/80 text-sm mb-1">Flood Hotline</p>
                                <p className="text-3xl font-bold">+254-XXX-XXXX</p>
                            </div>
                        </div>
                    </div>

                    {/* Safety Sections */}
                    <div className="space-y-6">
                        <SafetySection
                            title="Before a Flood"
                            icon={Droplets}
                            color="aqua-500"
                            tips={[
                                "Monitor weather forecasts and flood warnings regularly",
                                "Prepare emergency supplies: food, water, medicine, documents",
                                "Identify evacuation routes and safe zones in your area",
                                "Move valuable items to higher floors",
                                "Turn off utilities if evacuation is advised",
                                "Keep emergency contacts readily available",
                            ]}
                        />

                        <SafetySection
                            title="During a Flood"
                            icon={AlertTriangle}
                            color="orange-500"
                            tips={[
                                "Move to higher ground immediately if flooding occurs",
                                "Never walk, swim, or drive through floodwaters",
                                "Avoid contact with floodwater (may be contaminated)",
                                "Stay away from downed power lines and electrical wires",
                                "If trapped, go to the highest level and signal for help",
                                "Follow evacuation orders from authorities",
                            ]}
                        />

                        <SafetySection
                            title="After a Flood"
                            icon={Home}
                            color="emerald-500"
                            tips={[
                                "Return home only when authorities declare it safe",
                                "Check for structural damage before entering buildings",
                                "Avoid standing water and contaminated areas",
                                "Use bottled water until supply is declared safe",
                                "Document damage with photos for insurance claims",
                                "Watch for displaced wildlife and hazards",
                            ]}
                        />
                    </div>

                    {/* Community Preparedness */}
                    <div className="bg-white rounded-2xl p-8 mt-8 shadow-card">
                        <h3 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-3 font-display">
                            <Users className="w-6 h-6 text-aqua-500" />
                            Community Preparedness
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "Identify flood-prone areas in your neighborhood",
                                "Know evacuation routes and assembly points",
                                "Join community alert groups (WhatsApp/Telegram)",
                                "Report flooding immediately using Flood Watch",
                                "Help vulnerable neighbors prepare and evacuate",
                                "Participate in community flood drills",
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-3 text-navy-900">
                                    <span className="text-emerald-500 font-bold mt-1 text-xl">✓</span>
                                    <span className="leading-relaxed">{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SafetySection({ title, icon: Icon, color, tips }: any) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-card">
            <div className={`bg-${color} p-6 text-white`}>
                <h3 className="text-2xl font-bold flex items-center gap-3 font-display">
                    <Icon className="w-7 h-7" />
                    {title}
                </h3>
            </div>
            <div className="p-6">
                <ul className="space-y-3">
                    {tips.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-navy-900">
                            <span className="text-aqua-500 font-bold mt-1 flex-shrink-0">•</span>
                            <span className="leading-relaxed">{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
