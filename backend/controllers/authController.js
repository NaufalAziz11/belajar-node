const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const register = async (req, res) => {
    const { username, email, password, role_id } = req.body;
    try {
        if (!role_id) {
            return res.status(400).json({ message: 'Role ID is required' });
        }

        const existingUsername = await userModel.findByUsername(username);
        const existingEmail = await userModel.findByEmail(email);

        if (existingUsername || existingEmail) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.createUser(username, email, hashedPassword, role_id);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'The email you entered does not belong to an account' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'The password you entered is incorrect' });
        }

        // Include role name and username in token payload
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role_name, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                username: user.username,
                role: user.role_name || 'Super Admin' // Fallback
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await userModel.deleteUser(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, getUsers, deleteUser };
