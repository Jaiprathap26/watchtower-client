import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, Menu, X } from 'lucide-react';
import { TOKEN_KEY } from '../lib/api';

export default function AppLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                            <span className="text-lg sm:text-xl font-bold text-gray-900">WatchTower</span>
                        </div>
                        {/* Close button for mobile */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setSidebarOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm sm:text-base text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm sm:text-base text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-600" />
                        <span className="text-lg font-bold text-gray-900">WatchTower</span>
                    </div>
                    <div className="w-10" /> {/* Spacer for centering */}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}