import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import api from '../lib/api';

interface Monitor {
    id: string;
    name: string;
    url: string;
    status: 'up' | 'down' | 'pending';
    lastCheckedAt: string | null;
    uptime7d: number;
}

interface Incident {
    id: string;
    monitorName: string;
    startedAt: string;
    resolvedAt: string | null;
    durationSeconds: number | null;
}

interface StatusData {
    user: {
        name: string;
    };
    overallStatus: 'operational' | 'partial' | 'major';
    stats: {
        total: number;
        up: number;
        down: number;
    };
    monitors: Monitor[];
    recentIncidents: Incident[];
}

export default function StatusPage() {
    const { userId } = useParams<{ userId: string }>();
    const [data, setData] = useState<StatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        fetchStatusData();

        // Auto-refresh every 60 seconds
        const interval = setInterval(() => {
            fetchStatusData(true);
        }, 60000);

        return () => clearInterval(interval);
    }, [userId]);

    const fetchStatusData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await api.get(`/api/status/${userId}`);
            setData(response.data);
            setError('');
            setLastUpdate(new Date());
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to load status page');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getRelativeTime = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins}m`;

        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ${mins % 60}m`;

        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'up':
                return 'Operational';
            case 'down':
                return 'Down';
            case 'pending':
                return 'Checking...';
            default:
                return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
                    <div className="text-gray-600">Loading status...</div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Status Page Not Found</h1>
                <p className="text-gray-600 text-center max-w-md">
                    {error || 'This status page does not exist or has been removed'}
                </p>
            </div>
        );
    }

    const overallStatusConfig = {
        operational: {
            label: 'All Systems Operational',
            icon: CheckCircle,
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            iconColor: 'text-green-600',
            dotColor: 'bg-green-500'
        },
        partial: {
            label: 'Partial Outage',
            icon: AlertCircle,
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            iconColor: 'text-yellow-600',
            dotColor: 'bg-yellow-500'
        },
        major: {
            label: 'Major Outage',
            icon: AlertCircle,
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            iconColor: 'text-red-600',
            dotColor: 'bg-red-500'
        }
    }[data.overallStatus];

    const StatusIcon = overallStatusConfig.icon;

    const monitorStatusColor = {
        up: 'bg-green-500',
        down: 'bg-red-500',
        pending: 'bg-gray-400'
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Activity className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Status</h1>
                        </div>
                        <button
                            onClick={() => fetchStatusData(true)}
                            disabled={refreshing}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <p className="text-gray-600">{data.user.name}'s Services</p>
                    <p className="text-xs text-gray-500 mt-2">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overall Status Banner */}
                <div className={`mb-8 p-6 rounded-lg border-2 ${overallStatusConfig.bg} ${overallStatusConfig.border}`}>
                    <div className="flex items-center gap-3">
                        <StatusIcon className={`w-6 h-6 ${overallStatusConfig.iconColor}`} />
                        <div className="flex-1">
                            <h2 className={`text-xl font-bold ${overallStatusConfig.text}`}>
                                {overallStatusConfig.label}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {data.stats.up} of {data.stats.total} service{data.stats.total !== 1 ? 's' : ''} operational
                            </p>
                        </div>
                        <div className={`hidden sm:block w-3 h-3 rounded-full ${overallStatusConfig.dotColor} animate-pulse`} />
                    </div>
                </div>

                {/* Services/Monitors List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Services</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {data.monitors.length > 0 ? (
                            data.monitors.map((monitor) => (
                                <div key={monitor.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-3 h-3 rounded-full ${monitorStatusColor[monitor.status]} flex-shrink-0`} />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-medium text-gray-900 truncate">{monitor.name}</h4>
                                                <p className="text-sm text-gray-500 truncate">{monitor.url}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {monitor.uptime7d.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-gray-500">7d uptime</div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${monitor.status === 'up'
                                                    ? 'bg-green-100 text-green-800'
                                                    : monitor.status === 'down'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {getStatusLabel(monitor.status)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center text-gray-500">
                                No services configured yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Incidents */}
                {data.recentIncidents.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Recent Incidents</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {data.recentIncidents.map((incident) => (
                                <div key={incident.id} className="px-6 py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-gray-900">{incident.monitorName}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Resolved {getRelativeTime(incident.resolvedAt!)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Started: {new Date(incident.startedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-sm font-medium text-gray-900">
                                                {incident.durationSeconds ? formatDuration(incident.durationSeconds) : 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-500">Duration</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Powered by WatchTower</p>
                    <p className="mt-1">Real-time monitoring • Auto-refresh every 60s</p>
                </div>
            </div>
        </div>
    );
}