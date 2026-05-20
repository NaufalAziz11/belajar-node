const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const { getDashboardData } = require('../controllers/reportController');

router.use(verifyToken);
router.use(authorizeRole(['Super Admin', 'Manajer']));

router.get('/dashboard', getDashboardData);

module.exports = router;
