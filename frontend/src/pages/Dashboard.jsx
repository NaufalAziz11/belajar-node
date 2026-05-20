import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MasterDataPanel from '../components/MasterDataPanel';
import InventoryPanel from '../components/InventoryPanel';
import MenuPanel from '../components/MenuPanel';
import RecipeBuilderPanel from '../components/RecipeBuilderPanel';
import PosPanel from '../components/PosPanel';
import ReportsPanel from '../components/ReportsPanel';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('activeTab') || 'overview';
    });
    const [user, setUser] = useState({ username: 'Administrator', role: 'Super Admin' });

    const isTabAllowed = (tab, role) => {
        if (role === 'Super Admin' || role === 'Manajer') {
            return true;
        }
        if (role === 'Gudang') {
            return ['inventory', 'recipes'].includes(tab);
        }
        if (role === 'Kasir') {
            return ['pos'].includes(tab);
        }
        return false;
    };

    const getFirstAllowedTab = (role) => {
        if (role === 'Super Admin' || role === 'Manajer') return 'overview';
        if (role === 'Gudang') return 'inventory';
        if (role === 'Kasir') return 'pos';
        return 'pos';
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);

                // Route Guarding: Ensure current activeTab is allowed for this role
                const currentTab = localStorage.getItem('activeTab') || 'overview';
                if (!isTabAllowed(currentTab, parsed.role)) {
                    const fallbackTab = getFirstAllowedTab(parsed.role);
                    setActiveTab(fallbackTab);
                    localStorage.setItem('activeTab', fallbackTab);
                }
            } catch (e) {
                // Keep default
            }
        }
    }, [navigate]);

    useEffect(() => {
        if (isTabAllowed(activeTab, user.role)) {
            localStorage.setItem('activeTab', activeTab);
        }
    }, [activeTab, user.role]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeTab');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Elegant Premium Sidebar */}
            <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col justify-between shadow-2xl transition-all duration-300">
                <div>
                    {/* Brand Header */}
                    <div className="p-6 flex items-center gap-3 border-b border-gray-800">
                        <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            R
                        </div>
                        <div>
                            <h1 className="font-extrabold text-white text-lg tracking-wide">RestoERP</h1>
                            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">POS & ERP v1.0</span>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="mt-8 px-4 space-y-1">
                        {isTabAllowed('overview', user.role) && (
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-800 hover:text-white'}`}
                            >
                                📊 Overview Dashboard
                            </button>
                        )}
                        {isTabAllowed('pos', user.role) && (
                            <button
                                onClick={() => setActiveTab('pos')}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'pos' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-800 hover:text-white'}`}
                            >
                                🛍️ POS Kasir
                            </button>
                        )}
                        {isTabAllowed('inventory', user.role) && (
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-800 hover:text-white'}`}
                            >
                                📦 Bahan Baku (Inventory)
                            </button>
                        )}
                        {isTabAllowed('menus', user.role) && (
                            <button
                                onClick={() => setActiveTab('menus')}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'menus' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-800 hover:text-white'}`}
                            >
                                🍽️ Menu / Produk Jual
                            </button>
                        )}
                        {isTabAllowed('recipes', user.role) && (
                            <button
                                onClick={() => setActiveTab('recipes')}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'recipes' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-800 hover:text-white'}`}
                            >
                                🍳 Recipe Builder
                            </button>
                        )}
                        {isTabAllowed('master', user.role) && (
                            <button
                                onClick={() => setActiveTab('master')}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'master' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-800 hover:text-white'}`}
                            >
                                ⚙️ Master Data Settings
                            </button>
                        )}
                        {isTabAllowed('reports', user.role) && (
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-800 hover:text-white'}`}
                            >
                                📈 Laporan & Logs
                            </button>
                        )}
                    </nav>
                </div>

                {/* Sidebar Bottom Profile */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 font-sans">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-bold text-white leading-tight">{user.username}</p>
                            <span className="text-xs text-gray-500 font-semibold">{user.role}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all duration-200 font-sans"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
                {/* Header bar */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 capitalize">
                        {activeTab === 'master' ? 'Master Data Settings' : 
                         activeTab === 'inventory' ? 'Bahan Baku (Inventory)' : 
                         activeTab === 'menus' ? 'Menu / Produk Jual' : 
                         activeTab === 'recipes' ? 'Recipe Builder' : 
                         activeTab === 'pos' ? 'POS Kasir' : 
                         activeTab === 'overview' ? 'Overview Dashboard' : 
                         activeTab === 'reports' ? 'Laporan & Logs' : activeTab}
                    </h2>
                    <div className="text-sm text-gray-500 font-medium font-sans">
                        Hari ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                {/* Router Panel container */}
                <div className="p-8 max-w-7xl w-full mx-auto flex-1">
                    {activeTab === 'master' && isTabAllowed('master', user.role) && <MasterDataPanel />}
                    {activeTab === 'inventory' && isTabAllowed('inventory', user.role) && <InventoryPanel />}
                    {activeTab === 'menus' && isTabAllowed('menus', user.role) && <MenuPanel />}
                    {activeTab === 'recipes' && isTabAllowed('recipes', user.role) && <RecipeBuilderPanel />}
                    {activeTab === 'pos' && isTabAllowed('pos', user.role) && <PosPanel />}
                    {activeTab === 'overview' && isTabAllowed('overview', user.role) && <ReportsPanel />}
                    {activeTab === 'reports' && isTabAllowed('reports', user.role) && <ReportsPanel />}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
