import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, Loader2, Navigation } from 'lucide-react';
import { geolocationService } from '../../services/GeolocationService';
import { Button } from '../../components/Button';
import toast from 'react-hot-toast';
import axios from 'axios';

export const ReportIncident: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Location state
    const [location, setLocation] = useState<{ lat: number; lon: number; address?: string } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [addressSearch, setAddressSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Form state
    const [incidentType, setIncidentType] = useState('flooding');
    const [severity, setSeverity] = useState('medium');
    const [description, setDescription] = useState('');

    // Auto-detect location on mount
    useEffect(() => {
        handleDetectLocation();
    }, []);

    const handleDetectLocation = async () => {
        setLocationLoading(true);
        try {
            const loc = await geolocationService.getLocation();
            setLocation({
                lat: loc.lat,
                lon: loc.lon,
                address: loc.address,
            });
            toast.success('Location detected');
        } catch (error) {
            toast.error('Could not detect location. Please search manually.');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSearchAddress = async () => {
        if (!addressSearch.trim()) return;

        try {
            const results = await geolocationService.searchAddress(addressSearch);
            setSearchResults(results);
        } catch (error) {
            toast.error('Address search failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!location) {
            toast.error('Please select a location');
            return;
        }

        if (!description.trim()) {
            toast.error('Please provide a description');
            return;
        }

        setIsSubmitting(true);

        try {
            // Get user session
            const session = localStorage.getItem('supabase_session');
            const user = session ? JSON.parse(session).user : null;

            // Submit to backend API with correct format
            await axios.post('http://localhost:8000/api/reports/', {
                user_id: user?.id || 'anonymous',
                location: {
                    lat: location.lat,
                    lon: location.lon,
                },
                severity: severity,
                description: description || '',
                address: location.address || null,
                image_urls: [],
                video_urls: [],
            });

            toast.success('Report submitted successfully!');
            navigate('/dashboard/my-reports');
        } catch (error: any) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.detail || 'Failed to submit report');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Report Incident</h1>
                <p className="text-slate-400">Help your community by reporting flood incidents in your area</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location Section */}
                <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Location</h2>

                    {!location ? (
                        <div className="space-y-4">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleDetectLocation}
                                disabled={locationLoading}
                                className="w-full bg-teal-600 hover:bg-teal-500"
                            >
                                {locationLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Detecting...</>
                                ) : (
                                    <><Navigation className="w-5 h-5 mr-2" /> Detect My Location</>
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-navy-950 text-slate-500 uppercase tracking-widest">Or Search</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={addressSearch}
                                        onChange={(e) => setAddressSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchAddress())}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                        placeholder="Search for a location..."
                                    />
                                </div>
                                <Button type="button" onClick={handleSearchAddress} variant="secondary">
                                    Search
                                </Button>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {searchResults.map((result, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => {
                                                setLocation({
                                                    lat: result.lat,
                                                    lon: result.lon,
                                                    address: result.address,
                                                });
                                                setSearchResults([]);
                                            }}
                                            className="w-full text-left p-3 bg-navy-800 hover:bg-navy-700 rounded-lg text-white text-sm flex items-center gap-2"
                                        >
                                            <MapPin className="w-4 h-4 text-teal-400" />
                                            {result.address}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">Location Selected</h4>
                                        <p className="text-sm text-teal-200">{location.address || `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`}</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="glass"
                                    size="sm"
                                    onClick={() => setLocation(null)}
                                >
                                    Change
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Incident Details */}
                <div className="bg-navy-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Incident Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Incident Type</label>
                        <select
                            value={incidentType}
                            onChange={(e) => setIncidentType(e.target.value)}
                            className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-navy-900/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        >
                            <option value="flooding">Flooding</option>
                            <option value="landslide">Landslide</option>
                            <option value="heavy_rain">Heavy Rain</option>
                            <option value="river_overflow">River Overflow</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Severity Level</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { value: 'low', label: 'Low', color: 'bg-blue-600' },
                                { value: 'medium', label: 'Medium', color: 'bg-yellow-600' },
                                { value: 'high', label: 'High', color: 'bg-orange-600' },
                                { value: 'critical', label: 'Critical', color: 'bg-red-600' },
                            ].map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setSeverity(level.value)}
                                    className={`px-4 py-3 rounded-xl font-medium transition-all ${severity === level.value
                                        ? `${level.color} text-white`
                                        : 'bg-navy-800 text-slate-400 hover:bg-navy-700'
                                        }`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            placeholder="Describe the incident in detail... (water level, affected areas, etc.)"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="glass"
                        onClick={() => navigate('/dashboard')}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || !location}
                        className="flex-1 bg-teal-600 hover:bg-teal-500"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</>
                        ) : (
                            <><AlertTriangle className="w-5 h-5 mr-2" /> Submit Report</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
