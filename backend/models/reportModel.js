const db = require('../config/db');

const getDailyRevenue = async () => {
    const [rows] = await db.execute(`
        SELECT 
            COALESCE(SUM(total_price), 0) AS revenue,
            COALESCE(SUM(total_cogs), 0) AS cogs
        FROM sales 
        WHERE DATE(sale_date) = CURDATE() AND deleted_at IS NULL
    `);
    return {
        revenue: parseFloat(rows[0].revenue),
        cogs: parseFloat(rows[0].cogs)
    };
};

const getTopSellingMenus = async () => {
    const [rows] = await db.execute(`
        SELECT m.name, SUM(sd.quantity) AS qty_sold, SUM(sd.subtotal) AS total_revenue
        FROM sale_details sd 
        JOIN menus m ON sd.menu_id = m.id 
        WHERE sd.deleted_at IS NULL 
        GROUP BY sd.menu_id 
        ORDER BY qty_sold DESC 
        LIMIT 5
    `);
    return rows;
};

const getCriticalStockItems = async () => {
    const [rows] = await db.execute(`
        SELECT rm.*, u.symbol AS uom_symbol 
        FROM raw_materials rm
        JOIN uoms u ON rm.uom_id = u.id
        WHERE rm.current_stock <= rm.minimum_stock AND rm.deleted_at IS NULL
    `);
    return rows;
};

const getSalesHistory = async () => {
    const [rows] = await db.execute(`
        SELECT s.*, u.username AS cashier_name 
        FROM sales s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.deleted_at IS NULL 
        ORDER BY s.sale_date DESC 
        LIMIT 20
    `);
    return rows;
};

const getPurchasesHistory = async () => {
    const [rows] = await db.execute(`
        SELECT p.*, s.name AS supplier_name, u.username AS buyer_name 
        FROM purchases p
        JOIN suppliers s ON p.supplier_id = s.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.deleted_at IS NULL 
        ORDER BY p.purchase_date DESC 
        LIMIT 20
    `);
    return rows;
};

const getStockLedgerLog = async () => {
    const [rows] = await db.execute(`
        SELECT sl.*, rm.name AS material_name, u.symbol AS uom_symbol 
        FROM stock_ledger sl
        JOIN raw_materials rm ON sl.raw_material_id = rm.id
        JOIN uoms u ON rm.uom_id = u.id
        WHERE sl.deleted_at IS NULL
        ORDER BY sl.created_at DESC
        LIMIT 50
    `);
    return rows;
};

module.exports = {
    getDailyRevenue,
    getTopSellingMenus,
    getCriticalStockItems,
    getSalesHistory,
    getPurchasesHistory,
    getStockLedgerLog
};
