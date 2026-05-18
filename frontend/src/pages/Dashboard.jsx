import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">MyApp Dashboard</h1>
                <button 
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </nav>
            <main className="p-8">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Hello!</h2>
                    <p className="text-gray-600">You have successfully logged in. This is your protected dashboard.</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
