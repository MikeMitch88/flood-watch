import React, { ReactNode } from 'react';
import MainLayout from './MainLayout';

interface DashboardLayoutProps {
    children: ReactNode;
}

// Legacy wrapper for backward compatibility
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return <MainLayout>{children}</MainLayout>;
};
