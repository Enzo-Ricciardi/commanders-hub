import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Compass,
    Wrench,
    Users,
    Menu,
    X,
    Radio
} from 'lucide-react';

export const MainLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/trading', icon: <TrendingUp size={20} />, label: 'Trading & Economy' },
        { path: '/exploration', icon: <Compass size={20} />, label: 'Exploration' },
        { path: '/engineering', icon: <Wrench size={20} />, label: 'Engineering' },
        { path: '/community', icon: <Users size={20} />, label: 'Community & News' },
    ];

    return (
        <div className="flex h-screen bg-[#0c111a] text-gray-100 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#111827] border-r border-gray-800 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
                        <Radio className="animate-pulse" />
                        <span>CMDR HUB</span>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                                    ? 'bg-orange-500/10 text-orange-500 border-l-4 border-orange-500'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              `}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span>Systems Online</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center h-16 px-4 bg-[#111827] border-b border-gray-800">
                    <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold text-lg">Commander's Hub</span>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
