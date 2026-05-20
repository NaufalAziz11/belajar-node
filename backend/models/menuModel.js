const db = require('../config/db');

const getMenus = async (hasRecipeOnly = false) => {
    let query = `
        SELECT 
            m.*, 
            c.name AS category_name,
            (
                SELECT 
                    CASE 
                        WHEN COUNT(r.id) = 0 THEN NULL
                        ELSE FLOOR(MIN(rm.current_stock / r.quantity_needed))
                    END
                FROM recipes r
                JOIN raw_materials rm ON r.raw_material_id = rm.id
                WHERE r.menu_id = m.id AND r.deleted_at IS NULL AND rm.deleted_at IS NULL
            ) AS estimated_stock
        FROM menus m 
        JOIN categories c ON m.category_id = c.id 
        WHERE m.deleted_at IS NULL
    `;

    if (hasRecipeOnly) {
        query += ` AND EXISTS (SELECT 1 FROM recipes WHERE menu_id = m.id AND deleted_at IS NULL)`;
    }

    const [rows] = await db.execute(query);
    return rows;
};

const getMenuById = async (id) => {
    const [rows] = await db.execute(`
        SELECT 
            m.*, 
            c.name AS category_name,
            (
                SELECT 
                    CASE 
                        WHEN COUNT(r.id) = 0 THEN NULL
                        ELSE FLOOR(MIN(rm.current_stock / r.quantity_needed))
                    END
                FROM recipes r
                JOIN raw_materials rm ON r.raw_material_id = rm.id
                WHERE r.menu_id = m.id AND r.deleted_at IS NULL AND rm.deleted_at IS NULL
            ) AS estimated_stock
        FROM menus m 
        JOIN categories c ON m.category_id = c.id 
        WHERE m.id = ? AND m.deleted_at IS NULL
    `, [id]);
    return rows[0];
};

const createMenu = async (category_id, name, price, is_active) => {
    const [result] = await db.execute(
        'INSERT INTO menus (category_id, name, price, is_active) VALUES (?, ?, ?, ?)',
        [category_id, name, price, is_active !== undefined ? is_active : true]
    );
    return result.insertId;
};

const updateMenu = async (id, category_id, name, price, is_active) => {
    await db.execute(
        'UPDATE menus SET category_id = ?, name = ?, price = ?, is_active = ? WHERE id = ? AND deleted_at IS NULL',
        [category_id, name, price, is_active, id]
    );
};

const deleteMenu = async (id) => {
    await db.execute('UPDATE menus SET deleted_at = NOW() WHERE id = ?', [id]);
};

module.exports = {
    getMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu
};
