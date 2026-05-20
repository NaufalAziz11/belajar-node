const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const {
    getAllRawMaterials,
    getRawMaterialDetails,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    getRecipeForMenu,
    saveRecipeForMenu
} = require('../controllers/inventoryController');

router.use(verifyToken);
router.use(authorizeRole(['Super Admin', 'Gudang', 'Manajer']));

// Raw materials CRUD
router.get('/materials', getAllRawMaterials);
router.get('/materials/:id', getRawMaterialDetails);
router.post('/materials', createRawMaterial);
router.put('/materials/:id', updateRawMaterial);
router.delete('/materials/:id', deleteRawMaterial);

// Recipes for menu mapping
router.get('/recipes/:menuId', getRecipeForMenu);
router.post('/recipes/:menuId', saveRecipeForMenu);

module.exports = router;
