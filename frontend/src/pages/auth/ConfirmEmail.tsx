import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, CheckCircle, XCircle, Droplets } from 'lucide-react';

export const ConfirmEmail: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verifyEmail = async () => {
            // Supabase automatically handles email confirmation via URL hash
            // Check if we have a hash in the URL (Supabase magic link format)
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const type = hashParams.get('type');

            // Also check query params for token_hash format
            const tokenHash = searchParams.get('token_hash');
            const queryType = searchParams.get('type');

            console.log('Hash params:', { accessToken, refreshToken, type });
            console.log('Query params:', { tokenHash, queryType });

            // Handle hash-based confirmation (Supabase default)
            if (accessToken && type === 'signup') {
                try {
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    });

                    if (error) {
                        setStatus('error');
                        setMessage(error.message);
                    } else {
                        setStatus('success');
                        setMessage('Email verified successfully! Redirecting to dashboard...');

                        // Store session
                        localStorage.setItem('supabase_session', JSON.stringify(data.session));

                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 2000);
                    }
                } catch (error) {
                    setStatus('error');
                    setMessage('Verification failed. Please try again.');
                }
                return;
            }

            // Handle token_hash format (alternative)
            if (tokenHash && queryType === 'signup') {
                try {
                    const { error } = await supabase.auth.verifyOtp({
                        token_hash: tokenHash,
                        type: 'signup',
                    });

                    if (error) {
                        setStatus('error');
                        setMessage(error.message);
                    } else {
                        setStatus('success');
                        setMessage('Email verified successfully! Redirecting to dashboard...');
                        setTimeout(() => {
                            window.location.href = '/admin/dashboard';
                        }, 2000);
                    }
                } catch (error) {
                    setStatus('error');
                    setMessage('Verification failed. Please try again.');
                }
                return;
            }

            // No valid verification parameters found
            setStatus('error');
            setMessage('Invalid verification link. Please check your email and try again.');
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/50">
                            <Droplets className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">Flood Watch</span>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Verifying Email</h2>
                            <p className="text-slate-400">Please wait while we confirm your account...</p>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-teal-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                            <p className="text-slate-400">{message}</p>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                            <p className="text-slate-400 mb-6">{message}</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-colors"
                            >
                                Go to Login
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
