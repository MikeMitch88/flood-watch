import React, { useState } from 'react';
import { Sliders, Save, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/Button';
import toast from 'react-hot-toast';

export default function SystemSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        alertRadius: 10,
        verificationThreshold: 3,
        aiConfidenceMin: 75,
        autoVerify: true,
        emailNotifications: true,
        smsAlerts: false,
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('System settings updated successfully!');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-strong rounded-xl border border-slate-700/30 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Sliders className="w-6 h-6 text-teal-400" />
                System Settings
            </h2>

            <div className="space-y-8">
                {/* Alert Configuration */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Alert Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Default Alert Radius (km): {settings.alertRadius}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={settings.alertRadius}
                                onChange={(e) => setSettings({ ...settings, alertRadius: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                                <span>1 km</span>
                                <span>50 km</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-ocean-900/30 rounded-lg">
                            <div>
                                <h4 className="text-white font-medium mb-1">Email Notifications</h4>
                                <p className="text-sm text-slate-400">Send email alerts to subscribed users</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailNotifications ? 'bg-teal-600' : 'bg-slate-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-ocean-900/30 rounded-lg">
                            <div>
                                <h4 className="text-white font-medium mb-1">SMS Alerts</h4>
                                <p className="text-sm text-slate-400">Send SMS alerts for critical incidents</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, smsAlerts: !settings.smsAlerts })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.smsAlerts ? 'bg-teal-600' : 'bg-slate-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.smsAlerts ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Verification Settings */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Verification Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Community Verification Threshold: {settings.verificationThreshold}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={settings.verificationThreshold}
                                onChange={(e) => setSettings({ ...settings, verificationThreshold: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                            />
                            <p className="text-sm text-slate-400 mt-2">
                                Number of community verifications required before auto-approval
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                AI Confidence Minimum: {settings.aiConfidenceMin}%
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="100"
                                value={settings.aiConfidenceMin}
                                onChange={(e) => setSettings({ ...settings, aiConfidenceMin: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                            />
                            <p className="text-sm text-slate-400 mt-2">
                                Minimum AI confidence score for auto-verification
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-ocean-900/30 rounded-lg">
                            <div>
                                <h4 className="text-white font-medium mb-1">Auto-Verification</h4>
                                <p className="text-sm text-slate-400">Automatically verify reports meeting criteria</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, autoVerify: !settings.autoVerify })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoVerify ? 'bg-teal-600' : 'bg-slate-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoVerify ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-orange-400 font-bold mb-1">Important</h4>
                        <p className="text-sm text-slate-300">
                            Changes to system settings will affect all users and automated processes. Please review carefully before saving.
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-slate-700/50">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        variant="primary"
                        className="bg-teal-600 hover:bg-teal-500"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Settings
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
