import { Link } from 'react-router-dom';
import { Waves, Mail, Phone, Facebook, Twitter, Instagram, Youtube, Heart, MapPin, Zap } from 'lucide-react';

export default function PublicFooter() {
    return (
        <footer className="relative mt-20 glass-strong border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2.5 rounded-xl">
                                <Waves className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold gradient-text">Flood Watch</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Protecting communities through AI-powered flood monitoring and real-time alerts.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="p-2.5 glass hover:bg-gradient-to-r hover:from-cyan-600 hover:to-purple-600 rounded-xl transition-all hover:scale-110"
                                >
                                    <Icon className="w-5 h-5 text-gray-400 hover:text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'Live Map', to: '/map' },
                                { name: 'Active Alerts', to: '/alerts' },
                                { name: 'Safety Guide', to: '/safety' },
                                { name: 'About Us', to: '/about' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.to}
                                        className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Resources</h3>
                        <ul className="space-y-3">
                            {['Emergency Contacts', 'Flood Reports', 'API Documentation', 'Community Forum'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 group-hover:bg-purple-400"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-400" />
                            Contact
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-400">
                                <div className="p-2 bg-cyan-500/10 rounded-lg">
                                    <Mail className="w-4 h-4 text-cyan-400" />
                                </div>
                                <a href="mailto:support@floodwatch.com" className="hover:text-white transition-colors">
                                    support@floodwatch.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Phone className="w-4 h-4 text-purple-400" />
                                </div>
                                <span>+254-XXX-XXXX</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <div className="p-2 bg-pink-500/10 rounded-lg">
                                    <MapPin className="w-4 h-4 text-pink-400" />
                                </div>
                                <span>Nairobi, Kenya</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © 2024 Flood Watch. Built with <Heart className="inline w-4 h-4 text-red-400" /> for safer communities.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms of Service</a>
                            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
