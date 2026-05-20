import React, { useState, useEffect } from 'react';
import {
    getUoms, createUom, updateUom, deleteUom,
    getSuppliers, createSupplier, updateSupplier, deleteSupplier,
    getCategories, createCategory, updateCategory, deleteCategory,
    getRoles
} from '../services/masterService';
import {
    getUsers, registerUser, deleteUser as deleteUserApi
} from '../services/authService';

const MasterDataPanel = () => {
    const [activeSubTab, setActiveSubTab] = useState('uoms');
    
    // Data lists
    const [uoms, setUoms] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Modal & Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        // UoM specific
        name: '',
        symbol: '',
        // Supplier specific
        phone: '',
        address: '',
        // User specific
        username: '',
        email: '',
        password: '',
        role_id: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [activeSubTab]);

    const loadData = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            if (activeSubTab === 'uoms') {
                const res = await getUoms();
                setUoms(res.data);
            } else if (activeSubTab === 'suppliers') {
                const res = await getSuppliers();
                setSuppliers(res.data);
            } else if (activeSubTab === 'categories') {
                const res = await getCategories();
                setCategories(res.data);
            } else if (activeSubTab === 'users') {
                const res = await getUsers();
                setUsers(res.data);
                
                // Fetch roles for the select dropdown
                const rolesRes = await getRoles();
                setRoles(rolesRes.data);
            }
        } catch (err) {
            setErrorMsg('Failed to load data from server.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setModalMode('add');
        setEditingId(null);
        setFormData({
            name: '',
            symbol: '',
            phone: '',
            address: '',
            username: '',
            email: '',
            password: '',
            role_id: ''
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        if (activeSubTab === 'users') return; // User edit not supported
        setModalMode('edit');
        setEditingId(item.id);
        setFormData({
            name: item.name || '',
            symbol: item.symbol || '',
            phone: item.phone || '',
            address: item.address || '',
            username: '',
            email: '',
            password: '',
            role_id: ''
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
        try {
            if (activeSubTab === 'uoms') await deleteUom(id);
            else if (activeSubTab === 'suppliers') await deleteSupplier(id);
            else if (activeSubTab === 'categories') await deleteCategory(id);
            else if (activeSubTab === 'users') await deleteUserApi(id);
            loadData();
        } catch (err) {
            alert('Gagal menghapus data.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            if (activeSubTab === 'uoms') {
                if (modalMode === 'add') {
                    await createUom({ name: formData.name, symbol: formData.symbol });
                } else {
                    await updateUom(editingId, { name: formData.name, symbol: formData.symbol });
                }
            } else if (activeSubTab === 'suppliers') {
                if (modalMode === 'add') {
                    await createSupplier({ name: formData.name, phone: formData.phone, address: formData.address });
                } else {
                    await updateSupplier(editingId, { name: formData.name, phone: formData.phone, address: formData.address });
                }
            } else if (activeSubTab === 'categories') {
                if (modalMode === 'add') {
                    await createCategory({ name: formData.name });
                } else {
                    await updateCategory(editingId, { name: formData.name });
                }
            } else if (activeSubTab === 'users') {
                if (modalMode === 'add') {
                    await registerUser(formData.username, formData.email, formData.password, formData.role_id);
                }
            }
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.response?.data?.error || 'Terjadi kesalahan saat menyimpan data.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-300">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Master Data Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola data dasar operasional restoran Anda di sini.</p>
                </div>
                {activeSubTab !== 'users' || modalMode === 'add' ? (
                    <button
                        onClick={handleOpenAdd}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
                    >
                        + Tambah Baru
                    </button>
                ) : null}
            </div>

            {/* Sub-tabs Selection */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto gap-2">
                <button
                    onClick={() => setActiveSubTab('uoms')}
                    className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeSubTab === 'uoms' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Satuan Ukur (UoM)
                </button>
                <button
                    onClick={() => setActiveSubTab('suppliers')}
                    className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeSubTab === 'suppliers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Pemasok (Suppliers)
                </button>
                <button
                    onClick={() => setActiveSubTab('categories')}
                    className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeSubTab === 'categories' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Kategori Menu
                </button>
                {currentUser && currentUser.role === 'Super Admin' && (
                    <button
                        onClick={() => setActiveSubTab('users')}
                        className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeSubTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Kelola User
                    </button>
                )}
            </div>

            {/* Error Message */}
            {errorMsg && !isModalOpen && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                    {errorMsg}
                </div>
            )}

            {/* Main Table view */}
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
                                <th className="px-6 py-4">
                                    {activeSubTab === 'users' ? 'Username' : 'Nama'}
                                </th>
                                {activeSubTab === 'uoms' && <th className="px-6 py-4">Simbol</th>}
                                {activeSubTab === 'suppliers' && (
                                    <>
                                        <th className="px-6 py-4">Telepon</th>
                                        <th className="px-6 py-4">Alamat</th>
                                    </>
                                )}
                                {activeSubTab === 'users' && (
                                    <>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Tanggal Dibuat</th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-right rounded-r-xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {activeSubTab === 'uoms' && uoms.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-700">{item.name}</td>
                                    <td className="px-6 py-4"><span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-mono font-bold">{item.symbol}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenEdit(item)} className="text-amber-500 hover:text-amber-600 font-semibold text-sm mr-4 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 font-semibold text-sm transition-colors">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {activeSubTab === 'suppliers' && suppliers.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-700">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.phone || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.address || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenEdit(item)} className="text-amber-500 hover:text-amber-600 font-semibold text-sm mr-4 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 font-semibold text-sm transition-colors">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {activeSubTab === 'categories' && categories.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-700">{item.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenEdit(item)} className="text-amber-500 hover:text-amber-600 font-semibold text-sm mr-4 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 font-semibold text-sm transition-colors">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {activeSubTab === 'users' && users.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-700">{item.username}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-bold">
                                            {item.role_name || 'Super Admin'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.role_name !== 'Super Admin' && (
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 font-semibold text-sm transition-colors">Hapus</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {((activeSubTab === 'uoms' && uoms.length === 0) ||
                              (activeSubTab === 'suppliers' && suppliers.length === 0) ||
                              (activeSubTab === 'categories' && categories.length === 0) ||
                              (activeSubTab === 'users' && users.length === 0)) && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-400 font-medium">Belum ada data tersedia.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Sleek Popup Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scaleUp">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {modalMode === 'add' ? 'Tambah' : 'Edit'} {activeSubTab === 'uoms' ? 'Satuan' : activeSubTab === 'suppliers' ? 'Supplier' : activeSubTab === 'categories' ? 'Kategori' : 'User'}
                        </h3>
                        {errorMsg && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-xs font-semibold border border-red-100">
                                {errorMsg}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeSubTab === 'users' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Username</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                            placeholder="Masukkan username baru"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                            placeholder="Masukkan email user"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                            placeholder="Masukkan password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Role Peran</label>
                                        <select
                                            required
                                            value={formData.role_id}
                                            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                                        >
                                            <option value="">Pilih Peran User</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nama</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                            placeholder={`Masukkan nama ${activeSubTab}`}
                                        />
                                    </div>

                                    {activeSubTab === 'uoms' && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Simbol</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.symbol}
                                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                                placeholder="Contoh: gr, kg, pcs"
                                            />
                                        </div>
                                    )}

                                    {activeSubTab === 'suppliers' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">No. Telepon</label>
                                                <input
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                                    placeholder="Contoh: 0812345678"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Alamat</label>
                                                <textarea
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm h-24 resize-none"
                                                    placeholder="Masukkan alamat lengkap..."
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setErrorMsg(''); }}
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

export default MasterDataPanel;
