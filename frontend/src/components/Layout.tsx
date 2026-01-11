import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, Settings, LogOut, Bell, User as UserIcon, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './ui/button';
import { AnimatePresence, motion } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
        { icon: UserIcon, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden relative">
            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 w-64 border-r border-slate-800 bg-slate-900 flex flex-col z-50 transition-transform duration-300 lg:relative lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xl font-bold text-white">
                        TaskFlow AI
                    </span>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 p-2">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-1 mt-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <LogOut size={20} className="mr-3" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 lg:px-8 z-30">
                    <div className="flex items-center space-x-4 min-w-0">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 lg:hidden text-slate-400 hover:text-white shrink-0"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg font-semibold text-white truncate">
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-slate-400 hover:text-white relative"
                            >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 z-50"
                                    >
                                        <h3 className="text-sm font-bold mb-3 border-b border-slate-700 pb-2">Notifications</h3>
                                        <div className="space-y-3 max-h-60 overflow-y-auto">
                                            <div className="text-sm">
                                                <p className="font-medium text-blue-400">New assignment</p>
                                                <p className="text-slate-300">You were assigned to "Review API Docs"</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-medium text-slate-400">System update</p>
                                                <p className="text-slate-300">New features landed in TaskFlow v2.0</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center space-x-3 sm:border-l sm:border-slate-800 sm:pl-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">{user?.name}</p>
                                <p className="text-[10px] text-slate-500">{user?.email}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.[0].toUpperCase()
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Area */}
                <div className="flex-1 overflow-y-auto bg-slate-950 w-full min-w-0">
                    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
