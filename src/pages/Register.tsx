import { Link } from 'react-router-dom';

export default function Register() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
                <p className="text-gray-600 text-center">Register page coming soon...</p>
                <p className="text-center mt-4">
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Already have an account? Login
                    </Link>
                </p>
            </div>
        </div>
    );
}