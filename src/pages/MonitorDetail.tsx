import { useParams } from 'react-router-dom';

export default function MonitorDetail() {
    const { id } = useParams();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Monitor Detail</h1>
            <p className="text-gray-600">Monitor ID: {id}</p>
            <p className="text-gray-600">Monitor detail page coming soon...</p>
        </div>
    );
}