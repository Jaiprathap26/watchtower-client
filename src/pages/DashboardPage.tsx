import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import MonitorCard from '../components/MonitorCard';
import AddMonitorModal from '../components/AddMonitorModal';
import { MonitorCardSkeleton } from '../components/SkeletonLoader';

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
    const [userId, setUserId] = useState<string>('');
    const [showCopied, setShowCopied] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        document.title = 'Dashboard — WatchTower';
        fetchMonitors();
        fetchUserId();
    }, []);

    const fetchMonitors = async () => {
        try {
            setError('');
            const response = await api.get('/api/monitors');
            setMonitors(response.data.monitors);
        } catch (error: any) {
            console.error('Failed to fetch monitors:', error);
            setError('Failed to load monitors');
            toast.error('Failed to load monitors');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchUserId = async () => {
        try {
            const response = await api.get('/api/auth/me');
            setUserId(response.data.id);
        } catch (error) {
            console.error('Failed to fetch user ID:', error);
        }
    };

    const handleMonitorAdded = () => {
        fetchMonitors();
        toast.success('Monitor created successfully!');
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMonitors();
    };

    const handleShareStatus = () => {
        if (!userId) {
            toast.error('Unable to generate status page link');
            return;
        }

        const statusUrl = `${window.location.origin}/status/${userId}`;
        navigator.clipboard.writeText(statusUrl);
        setShowCopied(true);
        toast.success('Status page link copied to clipboard!');
        setTimeout(() => setShowCopied(false), 2000);
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
                        <div className="flex gap-2">
                            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>
                <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <MonitorCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && monitors.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load</h3>
                    <p className="text-gray-600 mb-4">Unable to fetch your monitors</p>
                    <button
                        onClick={() => {
                            setLoading(true);
                            fetchMonitors();
                        }}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                            Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                            {monitors.length} monitor{monitors.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {userId && (
                            <div className="relative">
                                <button
                                    onClick={handleShareStatus}
                                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    title="Share public status page"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Share</span>
                                </button>
                                {showCopied && (
                                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg z-50">
                                        Link copied!
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Add Monitor</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {monitors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 text-gray-300">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            No monitors yet
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md">
                            Start monitoring your websites and APIs by creating your first monitor
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Monitor
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {monitors.map((monitor) => (
                            <MonitorCard key={monitor.id} monitor={monitor} />
                        ))}
                    </div>
                )}
            </div>

            <AddMonitorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onMonitorAdded={handleMonitorAdded}
            />
        </div>
    );
}