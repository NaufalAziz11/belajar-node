const express = require('express');
const { register, login, getUsers, deleteUser } = require('../controllers/authController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', verifyToken, authorizeRole(['Super Admin']), register);
router.post('/login', login);
router.get('/users', verifyToken, authorizeRole(['Super Admin']), getUsers);
router.delete('/users/:id', verifyToken, authorizeRole(['Super Admin']), deleteUser);

module.exports = router;
