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
import { ConfirmEmail } from './pages/auth/ConfirmEmail';

// User Dashboard
import { UserDashboardLayout } from './components/UserDashboardLayout';
import { UserDashboard } from './pages/user/UserDashboard';
import { ReportIncident } from './pages/user/ReportIncident';
import { MyReports } from './pages/user/MyReports';
import { UserAlerts } from './pages/user/UserAlerts';
import { UserProfile } from './pages/user/UserProfile';

// Admin Layout & Pages
import { DashboardLayout } from './components/DashboardLayout';
import Dashboard from './pages/admin/Dashboard';
import Reports from './pages/admin/Reports';
import Incidents from './pages/admin/Incidents';
import Alerts from './pages/admin/Alerts';
import Analytics from './pages/admin/Analytics';
import Users from './pages/admin/Users';
import AIInsightsPage from './pages/admin/AIInsightsPage';
import Settings from './pages/admin/Settings';
import ProfileSettings from './pages/admin/settings/ProfileSettings';
import SystemSettings from './pages/admin/settings/SystemSettings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function UserPrivateRoute({ children }: { children: React.ReactNode }) {
    const supabaseSession = localStorage.getItem('supabase_session');
    return supabaseSession ? <>{children}</> : <Navigate to="/login" />;
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
                <Route path="/auth/confirm" element={<ConfirmEmail />} />

                {/* User Dashboard Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <UserPrivateRoute>
                            <UserDashboardLayout />
                        </UserPrivateRoute>
                    }
                >
                    <Route index element={<UserDashboard />} />
                    <Route path="report" element={<ReportIncident />} />
                    <Route path="my-reports" element={<MyReports />} />
                    <Route path="alerts" element={<UserAlerts />} />
                    <Route path="profile" element={<UserProfile />} />
                </Route>

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
                                    <Route path="users" element={<Users />} />
                                    <Route path="ai-insights" element={<AIInsightsPage />} />
                                    <Route path="settings" element={<Settings />}>
                                        <Route path="profile" element={<ProfileSettings />} />
                                        <Route path="system" element={<SystemSettings />} />
                                        <Route index element={<Navigate to="/admin/settings/profile" replace />} />
                                    </Route>
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

