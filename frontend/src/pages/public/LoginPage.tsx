import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Droplets, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { authAPI } from '../../api/client';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Try Supabase authentication first (for regular users)
            if (isSupabaseConfigured()) {
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password,
                    });

                    if (!error && data?.user) {
                        // Check if email is verified
                        if (!data.user.email_confirmed_at) {
                            toast.error('Please verify your email before logging in. Check your inbox for the verification link.');
                            await supabase.auth.signOut();
                            setIsLoading(false);
                            return;
                        }

                        // Supabase login successful - regular user
                        localStorage.setItem('supabase_session', JSON.stringify(data.session));
                        toast.success('Login successful!');
                        window.location.href = '/dashboard';
                        return;
                    }
                } catch (supabaseError) {
                    console.log('Supabase login failed, trying backend...', supabaseError);
                }
            }

            // Fallback to backend API (for admin users or if Supabase fails)
            const response = await authAPI.login(email, password);
            const { access_token } = response.data;

            localStorage.setItem('token', access_token);
            toast.success('Login successful!');
            window.location.href = '/admin/dashboard';
        } catch (error: any) {
            console.error('Login failed:', error);
            toast.error(error.response?.data?.detail || 'Invalid username or password');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 flex font-sans selection:bg-teal-500/30">
            {/* Left Panel - Hero Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-navy-900 border-r border-white/5 items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-navy-950" />
                <div className="absolute top-20 right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-500" />

                <div className="relative z-10 max-w-lg text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal-900/50">
                        <Droplets className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-display tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed mb-8">
                        Monitor floods, save lives, and protect your community with real-time alerts and AI-powered verification.
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur rounded-full border border-white/10">
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-teal-300">System Functional & Monitoring</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-navy-950">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <Droplets className="w-8 h-8 text-teal-400" />
                            <span className="text-xl font-bold text-white">Flood Watch</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Sign In</h2>
                    </div>

                    <div className="hidden lg:block mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                        <p className="text-slate-400">Enter your credentials to access the admin dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Username or Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all sm:text-sm"
                                        placeholder="admin"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all sm:text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500/50 bg-navy-900"
                                />
                                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/20 group"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-navy-950 text-slate-500">or</span>
                            </div>
                        </div>

                        <p className="text-center text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};
