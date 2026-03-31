import { useState, useEffect } from 'react';
import { Bell, Trash2, Plus, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Alert {
    id: string;
    type: string;
    value: string;
    createdAt: string;
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        document.title = 'Alerts — WatchTower';
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await api.get('/api/alerts');
            setAlerts(response.data.alerts);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            toast.error('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.post('/api/alerts', {
                type: 'email',
                value: email
            });

            toast.success('Email alert added successfully!');
            setEmail('');
            fetchAlerts();
        } catch (err: any) {
            const message = err.response?.data?.error?.message || 'Failed to add alert';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAlert = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this alert?')) return;

        try {
            await api.delete(`/api/alerts/${id}`);
            toast.success('Alert deleted successfully');
            fetchAlerts();
        } catch (error) {
            toast.error('Failed to delete alert');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="h-10 bg-gray-200 rounded animate-pulse w-48 mb-8" />
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4" />
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Alert Settings</h1>
                    </div>
                    <p className="text-gray-600">
                        Get notified when your monitors go down or recover
                    </p>
                </div>

                {/* Add Alert Form */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Add Email Alert</h2>

                    <form onSubmit={handleAddAlert} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    {submitting ? 'Adding...' : 'Add Alert'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Alerts List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">Active Alerts</h2>
                    </div>

                    {alerts.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{alert.value}</p>
                                            <p className="text-sm text-gray-500">
                                                Added {new Date(alert.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAlert(alert.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete alert"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-1">No alerts configured</p>
                            <p className="text-sm">Add an email address above to get started</p>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        How Alerts Work
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>You'll receive an email when any monitor goes down</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>You'll receive another email when it recovers</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Alerts are checked every minute along with health checks</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Multiple email addresses can be added for redundancy</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}