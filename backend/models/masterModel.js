const db = require('../config/db');

// --- ROLES ---
const getRoles = async () => {
    const [rows] = await db.execute('SELECT * FROM roles WHERE deleted_at IS NULL');
    return rows;
};

// --- UOMS ---
const getUoms = async () => {
    const [rows] = await db.execute('SELECT * FROM uoms WHERE deleted_at IS NULL');
    return rows;
};

const getUomById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM uoms WHERE id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
};

const createUom = async (name, symbol) => {
    const [result] = await db.execute(
        'INSERT INTO uoms (name, symbol) VALUES (?, ?)',
        [name, symbol]
    );
    return result.insertId;
};

const updateUom = async (id, name, symbol) => {
    await db.execute(
        'UPDATE uoms SET name = ?, symbol = ? WHERE id = ? AND deleted_at IS NULL',
        [name, symbol, id]
    );
};

const deleteUom = async (id) => {
    await db.execute('UPDATE uoms SET deleted_at = NOW() WHERE id = ?', [id]);
};

// --- SUPPLIERS ---
const getSuppliers = async () => {
    const [rows] = await db.execute('SELECT * FROM suppliers WHERE deleted_at IS NULL');
    return rows;
};

const getSupplierById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
};

const createSupplier = async (name, phone, address) => {
    const [result] = await db.execute(
        'INSERT INTO suppliers (name, phone, address) VALUES (?, ?, ?)',
        [name, phone, address]
    );
    return result.insertId;
};

const updateSupplier = async (id, name, phone, address) => {
    await db.execute(
        'UPDATE suppliers SET name = ?, phone = ?, address = ? WHERE id = ? AND deleted_at IS NULL',
        [name, phone, address, id]
    );
};

const deleteSupplier = async (id) => {
    await db.execute('UPDATE suppliers SET deleted_at = NOW() WHERE id = ?', [id]);
};

// --- CATEGORIES ---
const getCategories = async () => {
    const [rows] = await db.execute('SELECT * FROM categories WHERE deleted_at IS NULL');
    return rows;
};

const getCategoryById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
};

const createCategory = async (name) => {
    const [result] = await db.execute(
        'INSERT INTO categories (name) VALUES (?)',
        [name]
    );
    return result.insertId;
};

const updateCategory = async (id, name) => {
    await db.execute(
        'UPDATE categories SET name = ? WHERE id = ? AND deleted_at IS NULL',
        [name, id]
    );
};

const deleteCategory = async (id) => {
    await db.execute('UPDATE categories SET deleted_at = NOW() WHERE id = ?', [id]);
};

module.exports = {
    getRoles,
    getUoms,
    getUomById,
    createUom,
    updateUom,
    deleteUom,
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
