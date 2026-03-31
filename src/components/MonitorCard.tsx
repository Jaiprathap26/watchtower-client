import { useNavigate } from 'react-router-dom';
import { Globe, Clock } from 'lucide-react';

interface Monitor {
    id: string;
    name: string;
    url: string;
    status: 'up' | 'down' | 'pending';
    lastCheckedAt: string | null;
    interval: number;
}

interface MonitorCardProps {
    monitor: Monitor;
}

export default function MonitorCard({ monitor }: MonitorCardProps) {
    const navigate = useNavigate();

    const getRelativeTime = (date: string | null) => {
        if (!date) return 'Never';

        const now = new Date();
        const checkedAt = new Date(date);
        const diffMs = now.getTime() - checkedAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const statusColor = {
        up: 'bg-green-500',
        down: 'bg-red-500',
        pending: 'bg-gray-400'
    }[monitor.status];

    const truncateUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return url.substring(0, 30) + '...';
        }
    };

    return (
        <div
            onClick={() => navigate(`/monitors/${monitor.id}`)}
            className="p-4 sm:p-5 lg:p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${statusColor}`} />
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                        {monitor.name}
                    </h3>
                </div>
            </div>

            {/* URL */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{truncateUrl(monitor.url)}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{getRelativeTime(monitor.lastCheckedAt)}</span>
                </div>

                <div className="text-gray-600 font-medium flex-shrink-0">
                    {monitor.status === 'up' ? '100%' : monitor.status === 'down' ? '0%' : '-'}
                </div>
            </div>
        </div>
    );
}