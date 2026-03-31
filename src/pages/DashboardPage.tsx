import { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import MonitorCard from '../components/MonitorCard';
import AddMonitorModal from '../components/AddMonitorModal';

interface Monitor {
    id: string;
    name: string;
    url: string;
    status: 'up' | 'down' | 'pending';
    lastCheckedAt: string | null;
    interval: number;
}

export default function DashboardPage() {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchMonitors = async () => {
        try {
            const response = await api.get('/api/monitors');
            setMonitors(response.data.monitors);
        } catch (error) {
            console.error('Failed to fetch monitors:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMonitors();
    }, []);

    const handleMonitorAdded = () => {
        fetchMonitors();
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMonitors();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-600">Loading monitors...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Responsive */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Title Section */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                            Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                            {monitors.length} monitor{monitors.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh monitors"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>

                        {/* Add Monitor Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden xs:inline">Add</span>
                            <span className="hidden sm:inline">Monitor</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Empty State */}
                {monitors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 text-gray-300">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                            No monitors yet
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm">
                            Get started by adding your first monitor to track website uptime
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            Add Your First Monitor
                        </button>
                    </div>
                ) : (
                    /* Monitor Grid - Responsive */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {monitors.map((monitor) => (
                            <MonitorCard key={monitor.id} monitor={monitor} />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Monitor Modal */}
            <AddMonitorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onMonitorAdded={handleMonitorAdded}
            />
        </div>
    );
}