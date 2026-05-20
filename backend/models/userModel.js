const db = require('../config/db');

const findByUsername = async (username) => {
    const [rows] = await db.execute(`
        SELECT u.*, r.name AS role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.username = ? AND u.deleted_at IS NULL
    `, [username]);
    return rows[0];
};

const findByEmail = async (email) => {
    const [rows] = await db.execute(`
        SELECT u.*, r.name AS role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.email = ? AND u.deleted_at IS NULL
    `, [email]);
    return rows[0];
};

const createUser = async (username, email, hashedPassword, role_id) => {
    const [result] = await db.execute(
        'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role_id]
    );
    return result;
};

const getAllUsers = async () => {
    const [rows] = await db.execute(`
        SELECT u.id, u.username, u.email, u.role_id, r.name AS role_name, u.created_at
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.deleted_at IS NULL
    `);
    return rows;
};

const deleteUser = async (id) => {
    await db.execute('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id]);
};

module.exports = {
    findByUsername,
    findByEmail,
    createUser,
    getAllUsers,
    deleteUser
};
