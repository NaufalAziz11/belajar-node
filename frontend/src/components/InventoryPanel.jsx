import React, { useState, useEffect } from 'react';
import { getRawMaterials, createRawMaterial, updateRawMaterial, deleteRawMaterial } from '../services/inventoryService';
import { getUoms, getSuppliers } from '../services/masterService';
import { createPurchase } from '../services/transactionService';
import SearchableSelect from './SearchableSelect';

const InventoryPanel = () => {
    const [materials, setMaterials] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        uom_id: '',
        current_stock: '',
        minimum_stock: ''
    });

    // Purchasing modal states
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [purchaseItems, setPurchaseItems] = useState([
        { raw_material_id: '', quantity_bought: '1', price_per_unit: '1000' }
    ]);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        loadMaterials();
        loadUoms();
        loadSuppliers();
    }, []);

    const loadMaterials = async () => {
        setLoading(true);
        try {
            const res = await getRawMaterials();
            setMaterials(res.data);
        } catch (err) {
            setErrorMsg('Gagal memuat persediaan bahan baku.');
        } finally {
            setLoading(false);
        }
    };

    const loadUoms = async () => {
        try {
            const res = await getUoms();
            setUoms(res.data);
        } catch (err) {
            console.error('Gagal memuat satuan.');
        }
    };

    const loadSuppliers = async () => {
        try {
            const res = await getSuppliers();
            setSuppliers(res.data);
            if (res.data.length > 0) {
                setSelectedSupplierId(res.data[0].id);
            }
        } catch (err) {
            console.error('Gagal memuat supplier.');
        }
    };

    const handleOpenAdd = () => {
        setModalMode('add');
        setEditingId(null);
        setFormData({
            name: '',
            uom_id: uoms[0]?.id || '',
            current_stock: '0',
            minimum_stock: '0'
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setModalMode('edit');
        setEditingId(item.id);
        setFormData({
            name: item.name,
            uom_id: item.uom_id,
            current_stock: item.current_stock.toString(),
            minimum_stock: item.minimum_stock.toString()
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus bahan baku ini?')) return;
        try {
            await deleteRawMaterial(id);
            loadMaterials();
        } catch (err) {
            alert('Gagal menghapus bahan baku.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const payload = {
                name: formData.name,
                uom_id: parseInt(formData.uom_id),
                current_stock: parseFloat(formData.current_stock),
                minimum_stock: parseFloat(formData.minimum_stock)
            };
            if (modalMode === 'add') {
                await createRawMaterial(payload);
            } else {
                await updateRawMaterial(editingId, payload);
            }
            setIsModalOpen(false);
            loadMaterials();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan bahan baku.');
        }
    };

    // Purchasing actions
    const handleOpenPurchase = () => {
        if (suppliers.length === 0) {
            alert('Buat pemasok/supplier terlebih dahulu di halaman Master Data!');
            return;
        }
        if (materials.length === 0) {
            alert('Buat bahan baku terlebih dahulu!');
            return;
        }
        setSelectedSupplierId(suppliers[0].id);
        setPurchaseItems([{ raw_material_id: materials[0].id, quantity_bought: '1', price_per_unit: '1000' }]);
        setErrorMsg('');
        setIsPurchaseModalOpen(true);
    };

    const handleAddPurchaseRow = () => {
        setPurchaseItems([
            ...purchaseItems,
            { raw_material_id: materials[0].id, quantity_bought: '1', price_per_unit: '1000' }
        ]);
    };

    const handleRemovePurchaseRow = (index) => {
        const updated = [...purchaseItems];
        updated.splice(index, 1);
        setPurchaseItems(updated);
    };

    const handlePurchaseRowChange = (index, field, value) => {
        const updated = [...purchaseItems];
        updated[index] = {
            ...updated[index],
            [field]: value
        };
        setPurchaseItems(updated);
    };

    const calculateTotalCost = () => {
        return purchaseItems.reduce((sum, item) => {
            const qty = parseFloat(item.quantity_bought) || 0;
            const price = parseFloat(item.price_per_unit) || 0;
            return sum + (qty * price);
        }, 0);
    };

    const handleSubmitPurchase = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const totalCost = calculateTotalCost();
            const payload = {
                supplier_id: parseInt(selectedSupplierId),
                total_cost: totalCost,
                items: purchaseItems.map(item => ({
                    raw_material_id: parseInt(item.raw_material_id),
                    quantity_bought: parseFloat(item.quantity_bought),
                    price_per_unit: parseFloat(item.price_per_unit)
                }))
            };
            await createPurchase(payload);
            setIsPurchaseModalOpen(false);
            setSuccessMsg('Nota Pembelian supplier berhasil direkam!');
            loadMaterials();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal menyimpan transaksi pembelian.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Inventory / Gudang</h2>
                    <p className="text-sm text-gray-500 mt-1">Daftar persediaan bahan baku real-time.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleOpenPurchase}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
                    >
                        📥 Catat Pembelian (Barang Masuk)
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
                    >
                        + Tambah Bahan Baku
                    </button>
                </div>
            </div>

            {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm border border-green-100 font-semibold">
                    {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm border border-red-100 font-semibold">
                    {errorMsg}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                <th className="px-6 py-4 rounded-l-xl">No</th>
                                <th className="px-6 py-4">Nama Bahan</th>
                                <th className="px-6 py-4">Stok Saat Ini</th>
                                <th className="px-6 py-4">Min. Stok</th>
                                <th className="px-6 py-4">Harga Rata-Rata</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right rounded-r-xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {materials.map((item, index) => {
                                const isCritical = parseFloat(item.current_stock) <= parseFloat(item.minimum_stock);
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-700">{item.name}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {parseFloat(item.current_stock).toLocaleString('id-ID')} <span className="text-xs font-normal text-gray-500">{item.uom_symbol}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {parseFloat(item.minimum_stock).toLocaleString('id-ID')} <span className="text-xs text-gray-400">{item.uom_symbol}</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-700">
                                            Rp {parseFloat(item.average_cost || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isCritical ? (
                                                <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100 animate-pulse">Stok Kritis</span>
                                            ) : (
                                                <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100">Aman</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenEdit(item)} className="text-amber-500 hover:text-amber-600 font-semibold text-sm mr-4 transition-colors">Edit</button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 font-semibold text-sm transition-colors">Hapus</button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {materials.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-400 font-medium">Gudang kosong. Belum ada bahan baku terdaftar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CRUD Material Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scaleUp">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {modalMode === 'add' ? 'Tambah' : 'Edit'} Bahan Baku
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nama Bahan</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="Contoh: Beras, Susu Cair, Gula Pasir"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Satuan (UoM)</label>
                                <SearchableSelect
                                    options={uoms.map(u => ({ value: u.id, label: `${u.name} (${u.symbol})` }))}
                                    value={formData.uom_id}
                                    onChange={(val) => setFormData({ ...formData, uom_id: val })}
                                    placeholder="Pilih Satuan..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stok Saat Ini</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        disabled={modalMode === 'add'}
                                        value={formData.current_stock}
                                        onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        placeholder="0.00"
                                    />
                                    {modalMode === 'add' && (
                                        <div className="mt-2 text-[10px] leading-normal font-semibold text-gray-500 bg-gray-50 border border-gray-100 p-2.5 rounded-xl">
                                            ℹ️ Pendaftaran bahan baru wajib dimulai dari stok 0. Untuk mengisi stok beserta harga modalnya (HPP), silakan gunakan tombol <span className="text-emerald-600 font-bold">Catat Pembelian</span> setelah bahan disimpan.
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stok Minimal</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.minimum_stock}
                                        onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 text-sm font-semibold transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Purchasing Transaction Modal */}
            {isPurchaseModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 animate-scaleUp max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            Catat Pembelian Supplier (Barang Masuk)
                        </h3>
                        <form onSubmit={handleSubmitPurchase} className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Supplier / Pemasok</label>
                                <SearchableSelect
                                    options={suppliers.map(s => ({ value: s.id, label: `${s.name} (${s.phone})` }))}
                                    value={selectedSupplierId}
                                    onChange={(val) => setSelectedSupplierId(val)}
                                    placeholder="Pilih Supplier..."
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                                    <span className="text-sm font-bold text-gray-700">Daftar Bahan Baku Yang Dibeli</span>
                                    <button
                                        type="button"
                                        onClick={handleAddPurchaseRow}
                                        className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        + Tambah Baris
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                                    {purchaseItems.map((item, index) => {
                                        const selectedMat = materials.find(m => m.id === parseInt(item.raw_material_id));
                                        return (
                                            <div key={index} className="flex flex-col md:flex-row items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <div className="flex-1 w-full">
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bahan Baku</label>
                                                    <SearchableSelect
                                                        options={materials.map(m => ({ value: m.id, label: m.name }))}
                                                        value={item.raw_material_id}
                                                        onChange={(val) => handlePurchaseRowChange(index, 'raw_material_id', val)}
                                                        placeholder="Pilih Bahan..."
                                                    />
                                                </div>

                                                <div className="w-full md:w-28">
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Jumlah</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            required
                                                            value={item.quantity_bought}
                                                            onChange={(e) => handlePurchaseRowChange(index, 'quantity_bought', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none pr-8"
                                                            placeholder="0"
                                                        />
                                                        <span className="absolute right-2.5 top-2 text-[10px] font-bold text-gray-400">
                                                            {selectedMat?.uom_symbol || ''}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="w-full md:w-36">
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Harga Satuan (Rp)</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={item.price_per_unit}
                                                        onChange={(e) => handlePurchaseRowChange(index, 'price_per_unit', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none"
                                                        placeholder="Harga"
                                                    />
                                                </div>

                                                {purchaseItems.length > 1 && (
                                                    <div className="pt-3 md:pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePurchaseRow(index)}
                                                            className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Total and Submit Footer */}
                            <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-semibold">Total Pengeluaran</span>
                                    <div className="text-xl font-extrabold text-gray-800">
                                        Rp {calculateTotalCost().toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsPurchaseModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 text-sm font-semibold transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md transition-all"
                                    >
                                        Selesai & Rekam Pembelian
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPanel;
