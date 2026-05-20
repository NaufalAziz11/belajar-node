const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const {
    getAllRoles,
    getAllUoms,
    getUomDetails,
    createUom,
    updateUom,
    deleteUom,
    getAllSuppliers,
    getSupplierDetails,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getAllCategories,
    getCategoryDetails,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/masterController');

// All master routes require token authentication
router.use(verifyToken);

// Roles
router.get('/roles', authorizeRole(['Super Admin', 'Manajer', 'Gudang']), getAllRoles);

// UoMs
router.get('/uoms', authorizeRole(['Super Admin', 'Manajer', 'Gudang']), getAllUoms);
router.get('/uoms/:id', authorizeRole(['Super Admin', 'Manajer', 'Gudang']), getUomDetails);
router.post('/uoms', authorizeRole(['Super Admin', 'Manajer']), createUom);
router.put('/uoms/:id', authorizeRole(['Super Admin', 'Manajer']), updateUom);
router.delete('/uoms/:id', authorizeRole(['Super Admin', 'Manajer']), deleteUom);

// Suppliers
router.get('/suppliers', authorizeRole(['Super Admin', 'Manajer', 'Gudang']), getAllSuppliers);
router.get('/suppliers/:id', authorizeRole(['Super Admin', 'Manajer', 'Gudang']), getSupplierDetails);
router.post('/suppliers', authorizeRole(['Super Admin', 'Manajer']), createSupplier);
router.put('/suppliers/:id', authorizeRole(['Super Admin', 'Manajer']), updateSupplier);
router.delete('/suppliers/:id', authorizeRole(['Super Admin', 'Manajer']), deleteSupplier);

// Categories
router.get('/categories', authorizeRole(['Super Admin', 'Manajer', 'Gudang']), getAllCategories);
router.get('/categories/:id', authorizeRole(['Super Admin', 'Manajer', 'Gudang']), getCategoryDetails);
router.post('/categories', authorizeRole(['Super Admin', 'Manajer']), createCategory);
router.put('/categories/:id', authorizeRole(['Super Admin', 'Manajer']), updateCategory);
router.delete('/categories/:id', authorizeRole(['Super Admin', 'Manajer']), deleteCategory);

module.exports = router;
