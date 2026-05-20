import React, { useState, useEffect } from 'react';
import { getMenus, createMenu, updateMenu, deleteMenu } from '../services/menuService';
import { getCategories } from '../services/masterService';
import SearchableSelect from './SearchableSelect';

const MenuPanel = () => {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        price: '',
        is_active: true
    });
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        loadMenus();
        loadCategories();
    }, []);

    const loadMenus = async () => {
        setLoading(true);
        try {
            const res = await getMenus();
            setMenus(res.data);
        } catch (err) {
            setErrorMsg('Gagal memuat produk/menu jualan.');
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

    const handleOpenAdd = () => {
        setModalMode('add');
        setEditingId(null);
        setFormData({
            name: '',
            category_id: categories[0]?.id || '',
            price: '',
            is_active: true
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setModalMode('edit');
        setEditingId(item.id);
        setFormData({
            name: item.name,
            category_id: item.category_id,
            price: item.price.toString(),
            is_active: item.is_active === 1 || item.is_active === true
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
        try {
            await deleteMenu(id);
            loadMenus();
        } catch (err) {
            alert('Gagal menghapus menu.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const payload = {
                name: formData.name,
                category_id: parseInt(formData.category_id),
                price: parseFloat(formData.price),
                is_active: formData.is_active ? 1 : 0
            };
            if (modalMode === 'add') {
                await createMenu(payload);
            } else {
                await updateMenu(editingId, payload);
            }
            setIsModalOpen(false);
            loadMenus();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan menu.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Menu / Produk Jual</h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola daftar hidangan dan harga jual ke pelanggan.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
                >
                    + Tambah Produk Menu
                </button>
            </div>

            {errorMsg && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm border border-red-100">
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
                                <th className="px-6 py-4">Nama Menu</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Harga Jual</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right rounded-r-xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {menus.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-700">{item.name}</td>
                                    <td className="px-6 py-4"><span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-semibold">{item.category_name}</span></td>
                                    <td className="px-6 py-4 font-bold text-gray-800">
                                        Rp {parseFloat(item.price).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.is_active === 1 || item.is_active === true ? (
                                            <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100">Aktif</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">Nonaktif</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenEdit(item)} className="text-amber-500 hover:text-amber-600 font-semibold text-sm mr-4 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 font-semibold text-sm transition-colors">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {menus.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-400 font-medium">Belum ada menu terdaftar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scaleUp">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {modalMode === 'add' ? 'Tambah' : 'Edit'} Produk Menu
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nama Menu</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="Contoh: Kopi Susu Aren, Nasi Goreng Gila"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kategori</label>
                                <SearchableSelect
                                    options={categories.map(c => ({ value: c.id, label: c.name }))}
                                    value={formData.category_id}
                                    onChange={(val) => setFormData({ ...formData, category_id: val })}
                                    placeholder="Pilih Kategori..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Harga Jual (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="Contoh: 15000"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Tampilkan Menu di Aplikasi Kasir (Aktif)</label>
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
        </div>
    );
};

export default MenuPanel;
