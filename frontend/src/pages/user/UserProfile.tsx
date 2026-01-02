import React, { useState, useEffect } from 'react';
import { User, MapPin, Bell, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/Button';
import toast from 'react-hot-toast';

export const UserProfile: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [alertRadius, setAlertRadius] = useState(10);
    const [alertsEnabled, setAlertsEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('supabase_session');
        if (session) {
            const parsed = JSON.parse(session);
            setUser(parsed.user);
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                <p className="text-slate-400">Manage your account and notification preferences</p>
            </div>

            <div className="space-y-6">
                {/* User Info */}
                <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Account Information
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={user?.user_metadata?.full_name || 'Not set'}
                                disabled
                                className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-navy-800/50 text-white opacity-60 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={user?.email || 'Not set'}
                                disabled
                                className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-navy-800/50 text-white opacity-60 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">User ID</label>
                            <input
                                type="text"
                                value={user?.id || 'Not set'}
                                disabled
                                className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-navy-800/50 text-slate-400 opacity-60 cursor-not-allowed font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Alert Preferences */}
                <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Alert Preferences
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium mb-1">Enable Flood Alerts</h3>
                                <p className="text-sm text-slate-400">Receive notifications about floods in your area</p>
                            </div>
                            <button
                                onClick={() => setAlertsEnabled(!alertsEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${alertsEnabled ? 'bg-teal-600' : 'bg-slate-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${alertsEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Alert Radius: {alertRadius} km
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={alertRadius}
                                onChange={(e) => setAlertRadius(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                                <span>1 km</span>
                                <span>50 km</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-2">
                                You'll receive alerts for incidents within {alertRadius} km of your location
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        variant="primary"
                        className="bg-teal-600 hover:bg-teal-500"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
