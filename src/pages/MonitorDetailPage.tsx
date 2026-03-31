import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Edit, Trash2, Activity, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../lib/api';
import EditMonitorModal from '../components/EditMonitorModal';
import { StatCardSkeleton, ChartSkeleton, TableRowSkeleton } from '../components/SkeletonLoader';

interface Monitor {
    id: string;
    name: string;
    url: string;
    status: 'up' | 'down' | 'pending';
    interval: number;
    lastCheckedAt: string | null;
}

interface Stats {
    uptime: {
        h24: number;
        d7: number;
        d30: number;
    };
    avgResponseTime: {
        h24: number;
        d7: number;
        d30: number;
    };
    totalIncidents: number;
    currentStreak: number;
}

interface HealthCheck {
    id: string;
    statusCode: number | null;
    responseTimeMs: number;
    isUp: boolean;
    checkedAt: string;
}

interface Incident {
    id: string;
    startedAt: string;
    resolvedAt: string | null;
    durationSeconds: number | null;
}

export default function MonitorDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [monitor, setMonitor] = useState<Monitor | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [checks, setChecks] = useState<HealthCheck[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchMonitorData();
        }
    }, [id]);

    useEffect(() => {
        if (monitor) {
            document.title = `${monitor.name} — WatchTower`;
        }
    }, [monitor]);

    const fetchMonitorData = async () => {
        if (!id) {
            setError('No monitor ID provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const monitorRes = await api.get(`/api/monitors/${id}`);
            setMonitor(monitorRes.data);

            try {
                const statsRes = await api.get(`/api/monitors/${id}/stats`);
                setStats(statsRes.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }

            try {
                const checksRes = await api.get(`/api/monitors/${id}/checks`);
                setChecks(checksRes.data.checks || []);
            } catch (err) {
                console.error('Failed to fetch checks:', err);
                setChecks([]);
            }

            try {
                const incidentsRes = await api.get(`/api/monitors/${id}/incidents`);
                setIncidents(incidentsRes.data.incidents || []);
            } catch (err) {
                setIncidents([]);
            }

        } catch (error: any) {
            console.error('Failed to fetch monitor data:', error);
            setError(error.response?.data?.error?.message || 'Failed to load monitor');
            toast.error('Failed to load monitor details');

            if (error.response?.status === 404) {
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this monitor? This action cannot be undone.')) return;

        try {
            await api.delete(`/api/monitors/${id}`);
            toast.success('Monitor deleted successfully');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to delete monitor');
        }
    };

    const getRelativeTime = (date: string | null) => {
        if (!date) return 'Never';

        const now = new Date();
        const checkedAt = new Date(date);
        const diffMs = now.getTime() - checkedAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return 'Ongoing';

        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (mins === 0) return `${secs}s`;
        if (mins < 60) return `${mins}m ${secs}s`;

        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hours}h ${remainingMins}m`;
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4" />
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2" />
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-64" />
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </div>
                    <ChartSkeleton />
                </div>
            </div>
        );
    }

    // Error state
    if (error || !monitor) {
        return (
            <div className="flex flex-col items-center justify-center h-screen px-4">
                <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitor Not Found</h3>
                    <p className="text-gray-600 mb-4">{error || 'This monitor does not exist or has been deleted'}</p>
                    <Link
                        to="/dashboard"
                        className="inline-block px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const chartData = checks
        .slice()
        .reverse()
        .map((check) => ({
            time: new Date(check.checkedAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            responseTime: check.responseTimeMs
        }));

    const statusColor = {
        up: 'bg-green-100 text-green-800 border-green-200',
        down: 'bg-red-100 text-red-800 border-red-200',
        pending: 'bg-gray-100 text-gray-800 border-gray-200'
    }[monitor.status];

    const statusDotColor = {
        up: 'bg-green-500',
        down: 'bg-red-500',
        pending: 'bg-gray-400'
    }[monitor.status];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {monitor.name}
                                </h1>
                                <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-2 ${statusColor}`}>
                                    <div className={`w-2 h-2 rounded-full ${statusDotColor}`} />
                                    {monitor.status.toUpperCase()}
                                </div>
                            </div>

                            <a
                                href={monitor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm sm:text-base break-all"
                            >
                                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                <span className="break-all">{monitor.url}</span>
                            </a>

                            <p className="text-sm text-gray-600 mt-2">
                                Last checked: {getRelativeTime(monitor.lastCheckedAt)}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                <h3 className="text-sm font-medium text-gray-600">24h Uptime</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.uptime.h24.toFixed(1)}%</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="w-5 h-5 text-green-600" />
                                <h3 className="text-sm font-medium text-gray-600">7d Uptime</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.uptime.d7.toFixed(1)}%</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                <h3 className="text-sm font-medium text-gray-600">Avg Response (24h)</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.avgResponseTime.h24}ms</p>
                        </div>
                    </div>
                )}

                {/* Response Time Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Response Time (Last 50 Checks)</h2>

                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 12 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="responseTime"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                            <Clock className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-sm">No health check data available yet</p>
                            <p className="text-xs text-gray-400 mt-1">Data will appear after the first check</p>
                        </div>
                    )}
                </div>

                {/* Health Check History */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Health Checks</h2>

                    {checks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-gray-200">
                                    <tr className="text-left">
                                        <th className="pb-3 font-medium text-gray-600">Time</th>
                                        <th className="pb-3 font-medium text-gray-600">Status Code</th>
                                        <th className="pb-3 font-medium text-gray-600">Response Time</th>
                                        <th className="pb-3 font-medium text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {checks.slice(0, 20).map((check) => (
                                        <tr key={check.id}>
                                            <td className="py-3 text-gray-900">
                                                {new Date(check.checkedAt).toLocaleString()}
                                            </td>
                                            <td className="py-3">
                                                <span className={`font-mono ${check.statusCode && check.statusCode >= 200 && check.statusCode < 400 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {check.statusCode || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-gray-900">{check.responseTimeMs}ms</td>
                                            <td className="py-3">
                                                {check.isUp ? (
                                                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                                        UP
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                                                        DOWN
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Clock className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-sm">No health checks recorded yet</p>
                            <p className="text-xs text-gray-400 mt-1">Checks will appear here every {monitor.interval} minute{monitor.interval > 1 ? 's' : ''}</p>
                        </div>
                    )}
                </div>

                {/* Incidents List */}
                {stats && stats.totalIncidents > 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Incidents ({stats.totalIncidents})
                        </h2>

                        {incidents.length > 0 ? (
                            <div className="space-y-3">
                                {incidents.map((incident) => (
                                    <div
                                        key={incident.id}
                                        className="p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {incident.resolvedAt ? '✅ Resolved' : '🔴 Ongoing'}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Started: {new Date(incident.startedAt).toLocaleString()}
                                                </p>
                                                {incident.resolvedAt && (
                                                    <p className="text-xs text-gray-600">
                                                        Resolved: {new Date(incident.resolvedAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDuration(incident.durationSeconds)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <p className="text-sm">No incident details available</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Incidents</h2>
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-900">No incidents recorded</p>
                            <p className="text-xs text-gray-500 mt-1">This monitor has been healthy since creation</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Only render modal when monitor exists AND modal is open */}
            {monitor && isEditModalOpen && (
                <EditMonitorModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    monitor={monitor}
                    onMonitorUpdated={() => {
                        fetchMonitorData();
                    }}
                />
            )}
        </div>
    );
}