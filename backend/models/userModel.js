const db = require('../config/db');

const findByUsername = async (username) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ? AND deleted_at IS NULL', [username]);
    return rows[0];
};

const findByEmail = async (email) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
    return rows[0];
};

const createUser = async (username, email, hashedPassword) => {
    const [result] = await db.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
    );
    return result;
};

module.exports = {
    findByUsername,
    findByEmail,
    createUser
};
