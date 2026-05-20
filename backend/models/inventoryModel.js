const db = require('../config/db');

// --- RAW MATERIALS ---
const getRawMaterials = async () => {
    const [rows] = await db.execute(`
        SELECT rm.*, u.name AS uom_name, u.symbol AS uom_symbol 
        FROM raw_materials rm 
        JOIN uoms u ON rm.uom_id = u.id 
        WHERE rm.deleted_at IS NULL
    `);
    return rows;
};

const getRawMaterialById = async (id) => {
    const [rows] = await db.execute(`
        SELECT rm.*, u.name AS uom_name, u.symbol AS uom_symbol 
        FROM raw_materials rm 
        JOIN uoms u ON rm.uom_id = u.id 
        WHERE rm.id = ? AND rm.deleted_at IS NULL
    `, [id]);
    return rows[0];
};

const createRawMaterial = async (name, uom_id, current_stock, minimum_stock) => {
    const [result] = await db.execute(
        'INSERT INTO raw_materials (name, uom_id, current_stock, minimum_stock) VALUES (?, ?, ?, ?)',
        [name, uom_id, current_stock || 0.00, minimum_stock || 0.00]
    );
    return result.insertId;
};

const updateRawMaterial = async (id, name, uom_id, current_stock, minimum_stock) => {
    await db.execute(
        'UPDATE raw_materials SET name = ?, uom_id = ?, current_stock = ?, minimum_stock = ? WHERE id = ? AND deleted_at IS NULL',
        [name, uom_id, current_stock, minimum_stock, id]
    );
};

const deleteRawMaterial = async (id) => {
    await db.execute('UPDATE raw_materials SET deleted_at = NOW() WHERE id = ?', [id]);
};

// --- RECIPES (BoM) ---
const getRecipeByMenuId = async (menuId) => {
    const [rows] = await db.execute(`
        SELECT r.*, rm.name AS material_name, u.symbol AS uom_symbol 
        FROM recipes r 
        JOIN raw_materials rm ON r.raw_material_id = rm.id 
        JOIN uoms u ON rm.uom_id = u.id 
        WHERE r.menu_id = ? AND r.deleted_at IS NULL
    `, [menuId]);
    return rows;
};

const clearRecipeForMenu = async (menuId) => {
    await db.execute('UPDATE recipes SET deleted_at = NOW() WHERE menu_id = ? AND deleted_at IS NULL', [menuId]);
};

const createRecipeItem = async (menuId, rawMaterialId, quantityNeeded) => {
    const [result] = await db.execute(
        'INSERT INTO recipes (menu_id, raw_material_id, quantity_needed) VALUES (?, ?, ?)',
        [menuId, rawMaterialId, quantityNeeded]
    );
    return result.insertId;
};

module.exports = {
    getRawMaterials,
    getRawMaterialById,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    getRecipeByMenuId,
    clearRecipeForMenu,
    createRecipeItem
};
