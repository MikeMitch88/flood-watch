import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Waves, Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Welcome back, Administrator!');
            navigate('/admin');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-aqua-600 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-xl">
                            <Waves className="w-8 h-8 text-aqua-500" />
                        </div>
                        <span className="text-3xl font-bold text-white font-display">Flood Watch</span>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-aqua-500/10 rounded-full mb-4">
                            <Shield className="w-4 h-4 text-aqua-600" />
                            <span className="text-aqua-600 font-semibold text-sm tracking-wide">ADMIN ACCESS</span>
                        </div>
                        <h2 className="text-3xl font-bold text-navy-900 mb-2 font-display">Welcome Back</h2>
                        <p className="text-soft-grey">Sign in to manage the flood monitoring system</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-navy-900">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-soft-grey" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-soft-white border border-soft-border rounded-xl py-3.5 pl-12 pr-4 text-navy-900 placeholder-soft-grey focus:outline-none focus:border-aqua-500 focus:ring-2 focus:ring-aqua-500/20 transition-all"
                                    placeholder="admin@floodwatch.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-navy-900">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-soft-grey" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-soft-white border border-soft-border rounded-xl py-3.5 pl-12 pr-12 text-navy-900 placeholder-soft-grey focus:outline-none focus:border-aqua-500 focus:ring-2 focus:ring-aqua-500/20 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-soft-grey hover:text-navy-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-soft-border text-aqua-500 focus:ring-aqua-500/20"
                                />
                                <span className="text-soft-grey">Remember me</span>
                            </label>
                            <a href="#" className="text-aqua-500 hover:text-aqua-600 font-medium transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-navy-aqua text-white font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In to Dashboard
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Trust Indicators */}
                    <div className="mt-8 pt-6 border-t border-soft-border">
                        <div className="flex items-center justify-center gap-6 text-xs text-soft-grey">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Secure</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                <span>Encrypted</span>
                            </div>
                            <span>•</span>
                            <span>v2.0</span>
                        </div>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="text-white/90 hover:text-white transition-colors text-sm font-medium inline-flex items-center gap-2 group"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
