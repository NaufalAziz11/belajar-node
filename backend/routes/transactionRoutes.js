const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const { createPurchase, createSale } = require('../controllers/transactionController');

router.use(verifyToken);

router.post('/purchases', authorizeRole(['Super Admin', 'Gudang', 'Manajer']), createPurchase);
router.post('/sales', authorizeRole(['Super Admin', 'Kasir', 'Manajer']), createSale);

module.exports = router;
