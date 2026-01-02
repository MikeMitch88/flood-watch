import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Menu, X } from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll effect for sticky navbar
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    const navLinks = [
        { name: 'Features', path: '#features' },
        { name: 'How It Works', path: '#how-it-works' },
        { name: 'Live Map', path: '/map' },
        { name: 'About', path: '/about' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-navy-950/80 backdrop-blur-lg border-b border-white/10 shadow-lg' : 'bg-transparent border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className="relative">
                            <Droplets className="w-8 h-8 text-teal-400" />
                            <div className="absolute inset-0 bg-teal-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 font-display tracking-tight">
                            Flood Watch
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.path.startsWith('#') ? link.path : undefined}
                                onClick={(e) => {
                                    if (!link.path.startsWith('#')) {
                                        e.preventDefault();
                                        navigate(link.path);
                                    }
                                }}
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
                        >
                            Sign In
                        </button>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/signup')}
                            className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                        >
                            Get Started
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-slate-300 hover:text-white p-2"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-navy-900 border-b border-white/10 animate-fade-in">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.path.startsWith('#') ? link.path : undefined}
                                onClick={(e) => {
                                    if (!link.path.startsWith('#')) {
                                        e.preventDefault();
                                        navigate(link.path);
                                    }
                                    setMobileMenuOpen(false);
                                }}
                                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="pt-4 flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full text-center py-3 rounded-lg border border-slate-700 text-slate-300 font-medium"
                            >
                                Sign In
                            </button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/signup')}
                                className="w-full justify-center"
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
