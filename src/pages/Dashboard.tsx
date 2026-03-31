import { useEffect } from 'react';
import api from '../lib/api';

export default function Dashboard() {
    useEffect(() => {
        // Test API call
        api.get('/api/health')
            .then(res => console.log('API Response:', res.data))
            .catch(err => console.error('API Error:', err));
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <p className="text-gray-600">Dashboard page coming soon...</p>
        </div>
    );
}