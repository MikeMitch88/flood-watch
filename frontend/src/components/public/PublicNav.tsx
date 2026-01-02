import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Waves, Menu, X, Home, Map, Bell, Shield, Info, Sparkles, Zap } from 'lucide-react';

export default function PublicNav() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Live Map', href: '/map', icon: Map },
        { name: 'Alerts', href: '/alerts', icon: Bell },
        { name: 'Safety', href: '/safety', icon: Shield },
        { name: 'About', href: '/about', icon: Info },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed top-0 w-full z-50 glass-strong border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-gradient-to-r from-cyan-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                                <Waves className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <div>
                            <span className="text-2xl font-bold gradient-text">Flood Watch</span>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Zap className="w-3 h-3" />
                                <span>Real-Time Monitoring</span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive(item.href)
                                        ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
                                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            to="/admin/login"
                            className="ml-4 flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                        >
                            <Sparkles className="w-4 h-4" />
                            Admin
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 glass rounded-xl"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Menu className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden glass-strong border-t border-white/10">
                    <div className="px-4 py-6 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(item.href)
                                        ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white'
                                        : 'text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            to="/admin/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold mt-4"
                        >
                            <Sparkles className="w-5 h-5" />
                            Admin Login
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
