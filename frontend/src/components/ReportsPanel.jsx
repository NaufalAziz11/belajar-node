import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../services/reportService';

const ReportsPanel = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeSection, setActiveSection] = useState('summary'); // 'summary', 'sales', 'purchases', 'ledger'

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = user.role === 'Super Admin';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await getDashboardData();
            setData(res.data);
        } catch (err) {
            setErrorMsg('Gagal memuat laporan analitik dari server.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-semibold max-w-xl mx-auto mt-8 text-center">
                {errorMsg}
                <button onClick={loadData} className="block mx-auto mt-4 bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-red-700 transition-colors">
                    Coba Lagi
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Top KPI Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-${isSuperAdmin ? '4' : '3'} gap-6`}>
                {/* Revenue Card */}
                <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 translate-y-4 translate-x-4 text-9xl">💰</div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-200">Omzet Hari Ini</span>
                    <h3 className="text-3xl font-extrabold mt-2">
                        Rp {parseFloat(data.dailyRevenue?.revenue || 0).toLocaleString('id-ID')}
                    </h3>
                    <p className="text-xs text-indigo-100 mt-2">Dihitung otomatis dari POS penjualan hari ini.</p>
                </div>

                {/* Profit Card */}
                {isSuperAdmin && (
                    <div className="bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-10 translate-y-4 translate-x-4 text-9xl">📈</div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200">Laba Kotor Hari Ini</span>
                        <h3 className="text-3xl font-extrabold mt-2">
                            Rp {parseFloat((data.dailyRevenue?.revenue || 0) - (data.dailyRevenue?.cogs || 0)).toLocaleString('id-ID')}
                        </h3>
                        <p className="text-xs text-emerald-100 mt-2">
                            HPP (Modal): Rp {parseFloat(data.dailyRevenue?.cogs || 0).toLocaleString('id-ID')} ({data.dailyRevenue?.revenue > 0 ? (((data.dailyRevenue.revenue - data.dailyRevenue.cogs) / data.dailyRevenue.revenue) * 100).toFixed(1) : 0}%)
                        </p>
                    </div>
                )}

                {/* Best Seller menu */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100/50 flex flex-col justify-between">
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Top Menu Terlaris</span>
                        <h3 className="text-2xl font-extrabold text-gray-800 mt-2 truncate">
                            {data.topMenus[0]?.name || '-'}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {data.topMenus[0] ? `Terjual sebanyak ${data.topMenus[0].qty_sold} porsi` : 'Belum ada penjualan.'}
                    </p>
                </div>

                {/* Stock Warning Card */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100/50 flex flex-col justify-between">
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Bahan Baku Menipis</span>
                        <h3 className={`text-2xl font-extrabold mt-2 ${data.criticalStocks.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {data.criticalStocks.length} Item
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {data.criticalStocks.length > 0 ? 'Segera lakukan purchasing barang masuk!' : 'Stok semua bahan baku aman.'}
                    </p>
                </div>
            </div>

            {/* Sub-navigation tabs for logs */}
            <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
                <button
                    onClick={() => setActiveSection('summary')}
                    className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeSection === 'summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Ringkasan Analitik
                </button>
                <button
                    onClick={() => setActiveSection('sales')}
                    className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeSection === 'sales' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Riwayat Transaksi POS (Penjualan)
                </button>
                <button
                    onClick={() => setActiveSection('purchases')}
                    className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeSection === 'purchases' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Riwayat Purchasing (Barang Masuk)
                </button>
                <button
                    onClick={() => setActiveSection('ledger')}
                    className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeSection === 'ledger' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Kartu Stok (Ledger Gudang)
                </button>
            </div>

            {/* Active section panels */}
            {activeSection === 'summary' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Products Board */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100/50">
                        <h4 className="font-bold text-gray-800 text-base mb-4">🏆 5 Menu Terlaris</h4>
                        <div className="space-y-4">
                            {data.topMenus.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-indigo-100 text-indigo-700 h-6 w-6 flex items-center justify-center rounded-full text-xs font-extrabold">{index + 1}</span>
                                        <span className="font-bold text-xs text-gray-700">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-lg font-bold">{item.qty_sold} Porsi</span>
                                        <span className="text-[10px] text-gray-400 block mt-0.5">Rp {parseFloat(item.total_revenue).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            ))}
                            {data.topMenus.length === 0 && (
                                <div className="text-center py-12 text-gray-400 text-sm">Belum ada transaksi.</div>
                            )}
                        </div>
                    </div>

                    {/* Low stock indicators */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100/50">
                        <h4 className="font-bold text-gray-800 text-base mb-4">⚠️ Stok Bahan Kritis</h4>
                        <div className="space-y-4">
                            {data.criticalStocks.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-red-50/50 p-3 rounded-xl border border-red-100">
                                    <span className="font-bold text-xs text-gray-700">{item.name}</span>
                                    <div className="text-right">
                                        <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-lg font-bold">
                                            Stok: {parseFloat(item.current_stock).toLocaleString('id-ID')} {item.uom_symbol}
                                        </span>
                                        <span className="text-[10px] text-red-400 block mt-0.5">Min: {parseFloat(item.minimum_stock).toLocaleString('id-ID')} {item.uom_symbol}</span>
                                    </div>
                                </div>
                            ))}
                            {data.criticalStocks.length === 0 && (
                                <div className="text-center py-12 text-green-600 text-sm font-medium">Semua persediaan bahan baku aman terisi!</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'sales' && (
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100/50 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 font-sans">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                <th className="px-6 py-4 rounded-l-xl">No. Invoice</th>
                                <th className="px-6 py-4">Kasir</th>
                                <th className="px-6 py-4">Nama Pelanggan</th>
                                <th className="px-6 py-4">No. Meja</th>
                                <th className="px-6 py-4">Metode Bayar</th>
                                {isSuperAdmin && <th className="px-6 py-4">Modal (HPP)</th>}
                                <th className="px-6 py-4">Omzet</th>
                                {isSuperAdmin && <th className="px-6 py-4">Laba</th>}
                                <th className="px-6 py-4 text-right rounded-r-xl">Waktu Transaksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                            {data.salesHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">#TR-{item.id}</td>
                                    <td className="px-6 py-4 font-semibold">{item.cashier_name || 'Admin'}</td>
                                    <td className="px-6 py-4">{item.customer_name || '-'}</td>
                                    <td className="px-6 py-4 font-semibold">{item.table_number ? `Meja ${item.table_number}` : '-'}</td>
                                    <td className="px-6 py-4"><span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{item.payment_method}</span></td>
                                    {isSuperAdmin && <td className="px-6 py-4 text-gray-500 font-medium">Rp {parseFloat(item.total_cogs || 0).toLocaleString('id-ID')}</td>}
                                    <td className="px-6 py-4 font-bold text-gray-800">Rp {parseFloat(item.total_price).toLocaleString('id-ID')}</td>
                                    {isSuperAdmin && <td className="px-6 py-4 font-bold text-emerald-600">Rp {parseFloat(item.total_price - (item.total_cogs || 0)).toLocaleString('id-ID')}</td>}
                                    <td className="px-6 py-4 text-right text-gray-400">{new Date(item.sale_date).toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                            {data.salesHistory.length === 0 && (
                                <tr>
                                    <td colSpan={isSuperAdmin ? 9 : 7} className="text-center py-12 text-gray-400 font-medium">Belum ada transaksi penjualan terdaftar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSection === 'purchases' && (
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100/50 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                <th className="px-6 py-4 rounded-l-xl">No. Nota</th>
                                <th className="px-6 py-4">Penerima Barang</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Total Nota</th>
                                <th className="px-6 py-4 text-right rounded-r-xl">Waktu Transaksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                            {data.purchasesHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-emerald-600">#PO-{item.id}</td>
                                    <td className="px-6 py-4 font-semibold">{item.buyer_name || 'Admin'}</td>
                                    <td className="px-6 py-4">{item.supplier_name}</td>
                                    <td className="px-6 py-4"><span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{item.status}</span></td>
                                    <td className="px-6 py-4 font-bold">Rp {parseFloat(item.total_cost).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-right text-gray-400">{new Date(item.purchase_date).toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                            {data.purchasesHistory.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-400 font-medium">Belum ada transaksi purchasing barang masuk.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSection === 'ledger' && (
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100/50 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                <th className="px-6 py-4 rounded-l-xl">Bahan Baku</th>
                                <th className="px-6 py-4">Tipe Transaksi</th>
                                <th className="px-6 py-4">Reff ID</th>
                                <th className="px-6 py-4">Jumlah Perubahan</th>
                                <th className="px-6 py-4">Stok Akhir</th>
                                <th className="px-6 py-4 text-right rounded-r-xl">Waktu Catat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                            {data.stockLedger.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-bold text-gray-800">{item.material_name}</td>
                                    <td className="px-6 py-4 font-semibold">
                                        {item.transaction_type === 'IN_PURCHASE' ? (
                                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">BARANG MASUK</span>
                                        ) : item.transaction_type === 'OUT_SALE' ? (
                                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">PENJUALAN POS</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">OPNAME</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-gray-400">
                                        {item.transaction_type === 'IN_PURCHASE' ? `#PO-${item.reference_id}` : `#TR-${item.reference_id}`}
                                    </td>
                                    <td className={`px-6 py-4 font-bold ${parseFloat(item.qty_change) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {parseFloat(item.qty_change) > 0 ? '+' : ''}{parseFloat(item.qty_change).toLocaleString('id-ID')} <span className="text-[10px] font-normal text-gray-400">{item.uom_symbol}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{parseFloat(item.final_stock).toLocaleString('id-ID')} <span className="text-[10px] font-normal text-gray-500">{item.uom_symbol}</span></td>
                                    <td className="px-6 py-4 text-right text-gray-400">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                            {data.stockLedger.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-400 font-medium">Kartu stok masih kosong. Lakukan transaksi terlebih dahulu.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReportsPanel;
