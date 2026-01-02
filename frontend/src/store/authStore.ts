import { create } from 'zustand';
import { authAPI } from '../api/client';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    // Check for both backend token and Supabase session
    isAuthenticated: !!localStorage.getItem('token') || !!localStorage.getItem('supabase_session'),
    isLoading: false,

    login: async (username: string, password: string) => {
        try {
            set({ isLoading: true });
            const response = await authAPI.login(username, password);
            const { access_token } = response.data;

            localStorage.setItem('token', access_token);

            // Get user info
            const userResponse = await authAPI.getCurrentUser();

            set({
                token: access_token,
                user: userResponse.data,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('supabase_session');
        set({
            user: null,
            token: null,
            isAuthenticated: false,
        });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        const supabaseSession = localStorage.getItem('supabase_session');

        // If using Supabase, consider authenticated
        if (supabaseSession) {
            try {
                const session = JSON.parse(supabaseSession);
                set({
                    isAuthenticated: true,
                    user: session.user ? {
                        id: session.user.id,
                        username: session.user.email?.split('@')[0] || 'user',
                        email: session.user.email || '',
                        role: 'user',
                    } : null,
                });
                return;
            } catch (error) {
                localStorage.removeItem('supabase_session');
            }
        }

        // Fallback to backend token check
        if (!token) {
            set({ isAuthenticated: false });
            return;
        }

        try {
            const response = await authAPI.getCurrentUser();
            set({
                user: response.data,
                isAuthenticated: true,
                token,
            });
        } catch (error) {
            localStorage.removeItem('token');
            set({
                user: null,
                token: null,
                isAuthenticated: false,
            });
        }
    },
}));
