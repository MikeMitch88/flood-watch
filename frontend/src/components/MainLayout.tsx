import React from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-navy-950 flex flex-col">
            {/* Top Bar */}
            <TopBar />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
