import { useParams } from 'react-router-dom';

export default function StatusPage() {
    const { userId } = useParams();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Public Status Page</h1>
            <p className="text-gray-600">User ID: {userId}</p>
            <p className="text-gray-600">Status page coming soon...</p>
        </div>
    );
}