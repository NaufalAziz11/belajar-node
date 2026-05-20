import React, { useState, useEffect } from 'react';
import { getMenus } from '../services/menuService';
import { getCategories } from '../services/masterService';
import { createSale } from '../services/transactionService';

const PosPanel = () => {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [cart, setCart] = useState([]); // Array of { menu, quantity }
    
    // Order info
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        loadMenus();
        loadCategories();
    }, []);

    const loadMenus = async () => {
        setLoading(true);
        try {
            const res = await getMenus({ has_recipe: true });
            // Filter only active menus for sale
            setMenus(res.data.filter(m => m.is_active === 1 || m.is_active === true));
        } catch (err) {
            setErrorMsg('Gagal memuat menu untuk POS.');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data);
        } catch (err) {
            console.error('Gagal memuat kategori.');
        }
    };

    const addToCart = (menu) => {
        setErrorMsg('');
        setSuccessMsg('');
        const existing = cart.find(item => item.menu.id === menu.id);
        if (existing) {
            setCart(cart.map(item =>
                item.menu.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { menu, quantity: 1 }]);
        }
    };

    const updateQuantity = (menuId, change) => {
        const updated = cart.map(item => {
            if (item.menu.id === menuId) {
                const newQty = item.quantity + change;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean);
        setCart(updated);
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (parseFloat(item.menu.price) * item.quantity), 0);
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            setErrorMsg('Keranjang belanja kosong!');
            return;
        }
        setErrorMsg('');
        setSuccessMsg('');
        setIsConfirming(true);
    };

    const executePayment = async () => {
        setIsConfirming(false);
        setLoading(true);
        try {
            const totalPrice = calculateTotal();
            const payload = {
                customer_name: customerName,
                table_number: tableNumber,
                total_price: totalPrice,
                payment_method: paymentMethod,
                items: cart.map(item => ({
                    menu_id: item.menu.id,
                    quantity: item.quantity,
                    subtotal: parseFloat(item.menu.price) * item.quantity
                }))
            };
            await createSale(payload);
            setCart([]);
            setCustomerName('');
            setTableNumber('');
            setPaymentMethod('CASH');
            setSuccessMsg('Transaksi POS Berhasil Disimpan & Stok Otomatis Dipotong!');
            loadMenus();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Transaksi gagal. Periksa kembali ketersediaan stok bahan baku resep.');
        } finally {
            setLoading(false);
        }
    };

    const filteredMenus = activeCategory === 'all' 
        ? menus 
        : menus.filter(m => m.category_id === parseInt(activeCategory));

    return (
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto h-[calc(100vh-140px)]">
            {/* Left Products Section */}
            <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-xl p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800">🛍️ Kasir POS / Order Grid</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Pilih produk menu untuk dicatat di keranjang order.</p>
                </div>

                {/* Categories filtering pills */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-gray-100">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeCategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Semua Menu
                    </button>
                    {categories.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setActiveCategory(c.id.toString())}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${activeCategory === c.id.toString() ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                {/* Grid Products View */}
                {loading ? (
                    <div className="flex justify-center items-center flex-1">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto flex-1 pr-2">
                        {filteredMenus.map(menu => {
                            const estStock = menu.estimated_stock;
                            const isOutOfStock = estStock !== null && estStock <= 0;
                            
                            return (
                                <button
                                    key={menu.id}
                                    onClick={() => !isOutOfStock && addToCart(menu)}
                                    disabled={isOutOfStock}
                                    className={`p-4 rounded-2xl border text-left transition-all shadow-sm flex flex-col justify-between h-40 ${
                                        isOutOfStock 
                                        ? 'bg-gray-100/70 border-gray-200 opacity-60 cursor-not-allowed' 
                                        : 'bg-gray-50 hover:bg-indigo-50/50 border-gray-100 hover:border-indigo-200 hover:-translate-y-1'
                                    }`}
                                >
                                    <div>
                                        <div className="flex justify-between items-center gap-1.5 flex-wrap">
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                {menu.category_name}
                                            </span>
                                            {estStock === null ? (
                                                <span className="bg-indigo-50 text-indigo-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                                    Porsi: ∞
                                                </span>
                                            ) : estStock <= 0 ? (
                                                <span className="bg-red-50 text-red-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                                    Habis
                                                </span>
                                            ) : estStock <= 5 ? (
                                                <span className="bg-amber-50 text-amber-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                                    Sisa {estStock}
                                                </span>
                                            ) : (
                                                <span className="bg-green-50 text-green-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                                    {estStock} Porsi
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-sm mt-2 line-clamp-2">{menu.name}</h4>
                                    </div>
                                    <div className="text-indigo-600 font-extrabold text-sm">
                                        Rp {parseFloat(menu.price).toLocaleString('id-ID')}
                                    </div>
                                </button>
                            );
                        })}
                        {filteredMenus.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400 font-medium">
                                Tidak ada produk aktif yang tersedia.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Cart Section */}
            <div className="w-full lg:w-96 bg-white rounded-2xl shadow-xl p-6 flex flex-col justify-between h-full min-h-0 border border-gray-100">
                <div className="flex flex-col min-h-0 flex-1">
                    <div className="border-b border-gray-100 pb-4 mb-4 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Keranjang Belanja</h3>
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-lg font-bold">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                        </span>
                    </div>

                    {successMsg && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-xs font-semibold border border-green-100">
                            {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-xs font-semibold border border-red-100">
                            {errorMsg}
                        </div>
                    )}

                    {/* Cart Items list */}
                    <div className="overflow-y-auto flex-1 pr-2 space-y-3 mb-4 min-h-0">
                        {cart.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="truncate pr-2">
                                    <h5 className="font-bold text-gray-800 text-xs truncate">{item.menu.name}</h5>
                                    <span className="text-[10px] text-gray-400">Rp {parseFloat(item.menu.price).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item.menu.id, -1)}
                                        className="h-6 w-6 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-xs"
                                    >
                                        -
                                    </button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.menu.id, 1)}
                                        className="h-6 w-6 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-xs"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-16 text-gray-400 font-medium text-sm">
                                Keranjang masih kosong.<br/>Pilih menu di sebelah kiri.
                            </div>
                        )}
                    </div>

                    {/* Checkout inputs */}
                    {cart.length > 0 && (
                        <div className="space-y-3 pt-3 border-t border-gray-100 mb-4 bg-white">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Pelanggan</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Pelanggan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">No. Meja</label>
                                    <input
                                        type="text"
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Meja"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Metode Pembayaran</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none bg-white focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="CASH">Tunai (Cash)</option>
                                    <option value="QRIS">QRIS</option>
                                    <option value="CARD">Kartu Debit/Kredit</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer and Checkout Button */}
                <div className="border-t border-gray-100 pt-4 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase">Subtotal Order</span>
                        <span className="text-xl font-extrabold text-indigo-600">
                            Rp {calculateTotal().toLocaleString('id-ID')}
                        </span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
                    >
                        🚀 Proses Pembayaran & Bayar
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {isConfirming && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-scaleUp max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-4 text-indigo-600 border-b border-gray-100 pb-3">
                            <span className="text-2xl">📋</span>
                            <h3 className="text-xl font-bold text-gray-800">
                                Konfirmasi Pesanan Pelanggan
                            </h3>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Customer & Table details summary */}
                            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl text-xs font-semibold text-gray-600">
                                <div>
                                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Pelanggan</span>
                                    <span className="text-gray-800 font-bold">{customerName || 'Umum'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">No. Meja</span>
                                    <span className="text-gray-800 font-bold">{tableNumber || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Metode Bayar</span>
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold inline-block">
                                        {paymentMethod === 'CASH' ? 'Tunai' : paymentMethod === 'QRIS' ? 'QRIS' : 'Debit/Kredit'}
                                    </span>
                                </div>
                            </div>

                            {/* Order items checklist */}
                            <div>
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Daftar Menu & Kuantitas</span>
                                <div className="space-y-2 border border-gray-100 rounded-xl max-h-48 overflow-y-auto p-3 bg-white">
                                    {cart.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-400">x{item.quantity}</span>
                                                <span className="font-semibold text-gray-700">{item.menu.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-600">
                                                Rp {(parseFloat(item.menu.price) * item.quantity).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Alert warning for verification */}
                            <div className="bg-amber-50 border border-amber-100 text-amber-800 p-3.5 rounded-xl text-xs flex gap-2.5 items-start">
                                <span className="text-base mt-0.5">⚠️</span>
                                <p className="leading-relaxed">
                                    Pastikan kasir sudah membaca ulang daftar pesanan di atas kepada pelanggan sebelum memproses pembayaran!
                                </p>
                            </div>

                            {/* Grand Total Indicator */}
                            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <span className="text-xs font-bold text-indigo-700 uppercase">Total Yang Harus Dibayar</span>
                                <span className="text-2xl font-extrabold text-indigo-600">
                                    Rp {calculateTotal().toLocaleString('id-ID')}
                                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirming(false)}
                                    className="px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 text-sm font-semibold transition-colors"
                                >
                                    Kembali & Periksa
                                </button>
                                <button
                                    type="button"
                                    onClick={executePayment}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all hover:scale-105"
                                >
                                    Ya, Sudah Sesuai & Bayar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosPanel;
