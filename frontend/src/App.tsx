import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';
import PublicMap from './pages/public/PublicMap';
import LiveAlerts from './pages/public/LiveAlerts';
import SafetyGuide from './pages/public/SafetyGuide';
import AboutPage from './pages/public/AboutPage';

// Admin Layout & Pages
import { DashboardLayout } from './components/DashboardLayout';
import Dashboard from './pages/admin/Dashboard';
import Reports from './pages/admin/Reports';
import Incidents from './pages/admin/Incidents';
import Alerts from './pages/admin/Alerts';
import Analytics from './pages/admin/Analytics';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
            }} />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/map" element={<PublicMap />} />
                <Route path="/alerts" element={<LiveAlerts />} />
                <Route path="/safety" element={<SafetyGuide />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Admin Routes */}
                <Route
                    path="/admin/*"
                    element={
                        <PrivateRoute>
                            <DashboardLayout>
                                <Routes>
                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="reports" element={<Reports />} />
                                    <Route path="incidents" element={<Incidents />} />
                                    <Route path="alerts" element={<Alerts />} />
                                    <Route path="analytics" element={<Analytics />} />
                                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                </Routes>
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />

                {/* Redirects */}
                <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

