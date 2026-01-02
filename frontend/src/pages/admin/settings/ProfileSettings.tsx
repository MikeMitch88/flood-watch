import React, { useState } from 'react';
import { User, Mail, Save, Camera } from 'lucide-react';
import { Button } from '../../../components/Button';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';

export default function ProfileSettings() {
    const { user } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.username || '',
        email: user?.email || '',
        organization: 'Cloud-Watch Admin',
        role: 'Super Administrator',
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-strong rounded-xl border border-slate-700/30 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <User className="w-6 h-6 text-teal-400" />
                Profile Settings
            </h2>

            <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                            <User className="w-12 h-12 text-white" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-teal-600 rounded-full hover:bg-teal-500 transition-colors">
                            <Camera className="w-4 h-4 text-white" />
                        </button>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">{formData.fullName}</h3>
                        <p className="text-slate-400 text-sm">{formData.role}</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-4 py-3 bg-navy-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-navy-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Organization</label>
                        <input
                            type="text"
                            value={formData.organization}
                            disabled
                            className="w-full px-4 py-3 bg-navy-900/50 border border-slate-700/50 rounded-xl text-slate-400 opacity-60 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                        <input
                            type="text"
                            value={formData.role}
                            disabled
                            className="w-full px-4 py-3 bg-navy-900/50 border border-slate-700/50 rounded-xl text-slate-400 opacity-60 cursor-not-allowed"
                        />
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
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
