import { useState, useEffect, FormEvent } from 'react';
import { X } from 'lucide-react';
import api from '../lib/api';

interface Monitor {
    id: string;
    name: string;
    url: string;
    interval: number;
}

interface EditMonitorModalProps {
    isOpen: boolean;
    onClose: () => void;
    monitor: Monitor;
    onMonitorUpdated: () => void;
}

export default function EditMonitorModal({ isOpen, onClose, monitor, onMonitorUpdated }: EditMonitorModalProps) {
    const [formData, setFormData] = useState({
        name: monitor.name,
        url: monitor.url,
        interval: monitor.interval
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData({
            name: monitor.name,
            url: monitor.url,
            interval: monitor.interval
        });
    }, [monitor]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.put(`/api/monitors/${monitor.id}`, formData);
            onMonitorUpdated();
            onClose();
        } catch (err: any) {
            setError(
                err.response?.data?.error?.message ||
                'Failed to update monitor. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            <div className="relative w-full sm:w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-lg shadow-xl animate-slide-up sm:animate-none max-h-[90vh] overflow-y-auto">
                <div className="sm:hidden flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Edit Monitor
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Monitor Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                                URL
                            </label>
                            <input
                                id="url"
                                type="url"
                                required
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
                                Check Interval (minutes)
                            </label>
                            <input
                                id="interval"
                                type="number"
                                required
                                min={1}
                                max={60}
                                value={formData.interval}
                                onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">Between 1 and 60 minutes</p>
                        </div>

                        {error && (
                            <div className="p-3 text-xs sm:text-sm text-red-600 bg-red-50 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}