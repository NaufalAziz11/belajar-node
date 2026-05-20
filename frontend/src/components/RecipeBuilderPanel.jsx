import React, { useState, useEffect } from 'react';
import { getMenus } from '../services/menuService';
import { getRawMaterials, getRecipeForMenu, saveRecipeForMenu } from '../services/inventoryService';
import SearchableSelect from './SearchableSelect';

const RecipeBuilderPanel = () => {
    const [menus, setMenus] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [selectedMenuId, setSelectedMenuId] = useState('');
    const [recipeItems, setRecipeItems] = useState([]); // Array of { raw_material_id, quantity_needed }
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        loadMenus();
        loadRawMaterials();
    }, []);

    useEffect(() => {
        if (selectedMenuId) {
            loadRecipe(selectedMenuId);
        } else {
            setRecipeItems([]);
        }
    }, [selectedMenuId]);

    const loadMenus = async () => {
        try {
            const res = await getMenus();
            setMenus(res.data);
            if (res.data.length > 0) {
                setSelectedMenuId(res.data[0].id);
            }
        } catch (err) {
            setErrorMsg('Gagal memuat daftar menu.');
        }
    };

    const loadRawMaterials = async () => {
        try {
            const res = await getRawMaterials();
            setRawMaterials(res.data);
        } catch (err) {
            console.error('Gagal memuat bahan baku.');
        }
    };

    const loadRecipe = async (menuId) => {
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const res = await getRecipeForMenu(menuId);
            setRecipeItems(res.data.map(item => ({
                raw_material_id: item.raw_material_id,
                quantity_needed: item.quantity_needed.toString()
            })));
        } catch (err) {
            setErrorMsg('Gagal memuat resep untuk menu ini.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        if (rawMaterials.length === 0) return;
        setRecipeItems([
            ...recipeItems,
            { raw_material_id: rawMaterials[0].id, quantity_needed: '1' }
        ]);
    };

    const handleRemoveItem = (index) => {
        const updated = [...recipeItems];
        updated.splice(index, 1);
        setRecipeItems(updated);
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...recipeItems];
        updated[index] = {
            ...updated[index],
            [field]: value
        };
        setRecipeItems(updated);
    };

    const handleSave = async () => {
        if (!selectedMenuId) return;
        setErrorMsg('');
        setSuccessMsg('');
        
        // Validate duplicates
        const ids = recipeItems.map(item => parseInt(item.raw_material_id));
        const hasDuplicates = ids.some((val, i) => ids.indexOf(val) !== i);
        if (hasDuplicates) {
            setErrorMsg('Bahan baku tidak boleh duplikat di dalam satu resep.');
            return;
        }

        try {
            const itemsPayload = recipeItems.map(item => ({
                raw_material_id: parseInt(item.raw_material_id),
                quantity_needed: parseFloat(item.quantity_needed)
            }));
            await saveRecipeForMenu(selectedMenuId, itemsPayload);
            setSuccessMsg('Resep berhasil disimpan!');
        } catch (err) {
            setErrorMsg('Gagal menyimpan resep.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recipe Builder</h2>
                <p className="text-sm text-gray-500 mt-1">Gagas resep (Bill of Materials) untuk memotong persediaan otomatis saat penjualan.</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Menu Selection Panel */}
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pilih Produk Menu</label>
                    <div className="space-y-2">
                        {menus.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMenuId(m.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${selectedMenuId === m.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200/60'}`}
                            >
                                <div className="font-bold">{m.name}</div>
                                <div className={`text-xs ${selectedMenuId === m.id ? 'text-indigo-200' : 'text-gray-400'}`}>Rp {parseFloat(m.price).toLocaleString('id-ID')}</div>
                            </button>
                        ))}
                        {menus.length === 0 && (
                            <div className="text-center py-6 text-gray-400 text-sm">Belum ada menu. Buat menu jualan terlebih dahulu.</div>
                        )}
                    </div>
                </div>

                {/* Recipe Editor Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h3 className="text-lg font-bold text-gray-800">
                            Resep: {menus.find(m => m.id === selectedMenuId)?.name || 'Pilih Menu'}
                        </h3>
                        <button
                            type="button"
                            disabled={!selectedMenuId}
                            onClick={handleAddItem}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
                        >
                            + Tambah Bahan Baku
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recipeItems.map((item, index) => {
                                const selectedMaterial = rawMaterials.find(rm => rm.id === parseInt(item.raw_material_id));
                                return (
                                    <div key={index} className="flex flex-col md:flex-row items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex-1 w-full">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bahan Baku</label>
                                            <SearchableSelect
                                                options={rawMaterials.map(rm => ({ value: rm.id, label: `${rm.name} (${rm.uom_symbol})` }))}
                                                value={item.raw_material_id}
                                                onChange={(val) => handleItemChange(index, 'raw_material_id', val)}
                                                placeholder="Pilih Bahan Baku..."
                                            />
                                        </div>

                                        <div className="w-full md:w-32">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kuantitas</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={item.quantity_needed}
                                                    onChange={(e) => handleItemChange(index, 'quantity_needed', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none pr-10"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                                    {selectedMaterial?.uom_symbol || ''}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 md:pt-0">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {recipeItems.length === 0 && (
                                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl font-medium">
                                    Resep masih kosong. Klik "+ Tambah Bahan Baku" untuk merakit.
                                </div>
                            )}

                            {recipeItems.length > 0 && (
                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
                                    >
                                        Simpan Susunan Resep
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeBuilderPanel;
