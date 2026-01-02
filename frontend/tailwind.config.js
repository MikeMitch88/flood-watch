/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Deep Navy / Midnight Blue - Primary Background
                navy: {
                    50: '#f0f4f8',
                    100: '#d9e2ec',
                    200: '#bcccdc',
                    300: '#9fb3c8',
                    400: '#829ab1',
                    500: '#627d98',
                    600: '#486581',
                    700: '#334e68',
                    800: '#243b53',
                    900: '#102a43',
                    950: '#0f172a', // Deep navy background
                },
                // Ocean Blue - Dark Backgrounds
                ocean: {
                    50: '#e0f2fe',
                    100: '#bae6fd',
                    200: '#7dd3fc',
                    300: '#38bdf8',
                    400: '#0ea5e9',
                    500: '#0284c7',
                    600: '#0369a1',
                    700: '#075985',
                    800: '#0c4a6e',
                    900: '#082f49',
                    950: '#041e35',
                },
                // Rain - Secondary Text/UI
                rain: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                // Aqua - Primary Actions and Highlights
                aqua: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63',
                },
                // Cyan - Complementary Actions
                cyan: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63',
                },
                // Mint/Emerald - Success States
                mint: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                // Professional Teal - Actions, Links, Live Indicators
                teal: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6', // Primary teal accent
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                },
                // Soft Colors for Login Page
                'soft-grey': '#64748b',
                'soft-white': '#f8fafc',
                'soft-border': '#e2e8f0',
                // Soft White / Light Gray - Text Contrast  
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0', // Light text
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                // Status Colors - Calm & Professional
                safe: {
                    400: '#4ade80',
                    500: '#10b981', // Green (safe)
                    600: '#059669',
                },
                warning: {
                    400: '#fbbf24',
                    500: '#f59e0b', // Amber (warning)
                    600: '#d97706',
                },
                critical: {
                    400: '#f87171',
                    500: '#dc2626', // Muted red (critical)
                    600: '#b91c1c',
                },
                // Supporting Colors
                info: {
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Manrope', 'Plus Jakarta Sans', 'sans-serif'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1.5' }],
                'sm': ['0.875rem', { lineHeight: '1.5' }],
                'base': ['1rem', { lineHeight: '1.6' }],
                'lg': ['1.125rem', { lineHeight: '1.6' }],
                'xl': ['1.25rem', { lineHeight: '1.6' }],
                '2xl': ['1.5rem', { lineHeight: '1.5' }],
                '3xl': ['1.875rem', { lineHeight: '1.4' }],
                '4xl': ['2.25rem', { lineHeight: '1.3' }],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            boxShadow: {
                'subtle': '0 1px 3px rgba(0, 0, 0, 0.05)',
                'elevation-sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'elevation-md': '0 4px 16px rgba(0, 0, 0, 0.12)',
                'elevation-lg': '0 8px 24px rgba(0, 0, 0, 0.15)',
                'glow-teal': '0 0 20px rgba(20, 184, 166, 0.25)',
                'glow-safe': '0 0 20px rgba(16, 185, 129, 0.25)',
                'glow-warning': '0 0 20px rgba(245, 158, 11, 0.25)',
                'glow-critical': '0 0 20px rgba(220, 38, 38, 0.25)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in',
                'slide-in': 'slideIn 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            backgroundImage: {
                'gradient-navy-aqua': 'linear-gradient(135deg, #0c4a6e 0%, #06b6d4 100%)',
            },
        },
    },
    plugins: [],
};
