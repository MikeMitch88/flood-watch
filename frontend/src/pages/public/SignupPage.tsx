import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, MapPin, Droplets, ArrowRight, Check, Loader2, Navigation, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/Button';
import { geolocationService } from '../../services/GeolocationService';

type Step = 1 | 2 | 3;

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<Step>(1);

    // Step 1 - Basic Info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 2 - Location
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; address?: string } | null>(null);
    const [radius, setRadius] = useState(5); // km
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [addressSearch, setAddressSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    const handleDetectLocation = async () => {
        setLocationLoading(true);
        setLocationError(null);

        try {
            const location = await geolocationService.getLocation();
            setSelectedLocation({
                lat: location.lat,
                lon: location.lon,
                address: location.address,
            });
        } catch (error) {
            setLocationError(error instanceof Error ? error.message : 'Location detection failed');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSearchAddress = async () => {
        if (!addressSearch.trim()) return;

        setSearchLoading(true);
        try {
            const results = await geolocationService.searchAddress(addressSearch);
            setSearchResults(results);
        } catch (error) {
            setLocationError(error instanceof Error ? error.message : 'Address search failed');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const handleSubmit = () => {
        console.log('Signup complete');
        navigate('/admin/dashboard');
    };

    const handleVerificationInput = (index: number, value: string) => {
        if (value.length <= 1) {
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);

            // Auto-focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`code-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 flex font-sans selection:bg-teal-500/30">
            {/* Left Panel - Hero Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-navy-900 border-r border-white/5 items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-navy-950" />
                <div className="absolute top-20 left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-500" />

                <div className="relative z-10 max-w-lg text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal-900/50">
                        <Droplets className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-display tracking-tight">
                        Join the Network
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed mb-8">
                        Become part of a global community dedicated to disaster prevention and rapid response.
                    </p>

                    {/* Social Proof / Stats Mini Cards */}
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                            <div className="text-2xl font-bold text-white mb-1">15k+</div>
                            <div className="text-xs text-teal-400 font-medium uppercase tracking-wider">Active Users</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                            <div className="text-2xl font-bold text-white mb-1">98%</div>
                            <div className="text-xs text-teal-400 font-medium uppercase tracking-wider">Accuracy Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-navy-950">
                <div className="w-full max-w-lg">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <Droplets className="w-8 h-8 text-teal-400" />
                            <span className="text-xl font-bold text-white">Flood Watch</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Create Account</h2>
                    </div>

                    <div className="hidden lg:block mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-slate-400">Join the Flood Watch network today</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-between relative mb-12">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-navy-800 -z-10 transform -translate-y-1/2" />
                        {[
                            { step: 1, label: 'Account' },
                            { step: 2, label: 'Location' },
                            { step: 3, label: 'Verify' },
                        ].map((item) => (
                            <div key={item.step} className="flex flex-col items-center gap-2 relative z-10">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                                    ${currentStep >= item.step
                                        ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-900/50'
                                        : 'bg-navy-950 border-slate-700 text-slate-500'}
                                `}>
                                    {currentStep > item.step ? <Check size={18} /> : item.step}
                                </div>
                                <span className={`text-xs font-medium uppercase tracking-wider ${currentStep >= item.step ? 'text-teal-400' : 'text-slate-600'}`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-navy-900/30 p-1 rounded-2xl border border-white/5 p-6 md:p-8">
                        {/* Step 1 - Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2 - Location Selection */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-white">Set Your Alert Zone</h3>
                                    <p className="text-sm text-slate-400">Receive alerts for floods in your area</p>
                                </div>

                                {!selectedLocation && (
                                    <div className="space-y-4">
                                        <Button
                                            variant="primary"
                                            onClick={handleDetectLocation}
                                            disabled={locationLoading}
                                            className="w-full justify-center py-3 bg-teal-600 hover:bg-teal-500"
                                        >
                                            {locationLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Navigation className="w-5 h-5 mr-2" /> Detect My Location</>}
                                        </Button>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                                            <div className="relative flex justify-center text-xs"><span className="px-2 bg-navy-950 text-slate-500 uppercase tracking-widest">Or Search</span></div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={addressSearch}
                                                    onChange={(e) => setAddressSearch(e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                                                    placeholder="Enter city or address..."
                                                />
                                            </div>
                                            <Button variant="glass" onClick={handleSearchAddress} disabled={searchLoading || !addressSearch.trim()}>
                                                {searchLoading ? <Loader2 className="animate-spin" /> : 'Search'}
                                            </Button>
                                        </div>

                                        {searchResults.length > 0 && (
                                            <div className="mt-2 bg-navy-900 border border-slate-700 rounded-xl max-h-48 overflow-y-auto custom-scrollbar">
                                                {searchResults.map((result, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            setSelectedLocation({ lat: result.lat, lon: result.lon, address: result.address });
                                                            setSearchResults([]);
                                                            setAddressSearch('');
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-white/5 text-slate-300 hover:text-white text-sm border-b border-slate-800 last:border-0 transition-colors flex items-center gap-2"
                                                    >
                                                        <MapPin className="w-4 h-4 text-teal-400" />
                                                        {result.address}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedLocation && (
                                    <div className="p-6 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center animate-scale-in">
                                        <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-8 h-8 text-teal-400" />
                                        </div>
                                        <h4 className="text-white font-bold mb-1">Location Locked</h4>
                                        <p className="text-sm text-teal-200 mb-4">{selectedLocation.address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}`}</p>
                                        <Button variant="glass" size="sm" onClick={() => setSelectedLocation(null)}>Change Location</Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3 - Verification */}
                        {currentStep === 3 && (
                            <div className="text-center space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Verify Email</h3>
                                    <p className="text-sm text-slate-400">Enter code sent to <span className="text-white font-medium">{email}</span></p>
                                </div>

                                <div className="flex justify-center gap-2 sm:gap-4">
                                    {verificationCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`code-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleVerificationInput(index, e.target.value)}
                                            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-navy-900 border border-slate-700 rounded-lg text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
                                        />
                                    ))}
                                </div>

                                <button className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors">
                                    Resend Code
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8">
                        {currentStep > 1 && (
                            <Button
                                variant="glass"
                                onClick={handleBack}
                                className="flex-1 md:flex-none md:w-32"
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={currentStep === 3 ? handleSubmit : handleNext}
                            className={`flex-1 ${currentStep === 1 ? 'w-full' : ''} bg-teal-600 hover:bg-teal-500`}
                        >
                            {currentStep === 3 ? 'Complete Setup' : 'Continue'}
                            {currentStep < 3 && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
