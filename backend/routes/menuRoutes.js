const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const {
    getAllMenus,
    getMenuDetails,
    createMenu,
    updateMenu,
    deleteMenu
} = require('../controllers/menuController');

router.use(verifyToken);

router.get('/', authorizeRole(['Super Admin', 'Manajer', 'Gudang', 'Kasir']), getAllMenus);
router.get('/:id', authorizeRole(['Super Admin', 'Manajer', 'Gudang', 'Kasir']), getMenuDetails);
router.post('/', authorizeRole(['Super Admin', 'Manajer']), createMenu);
router.put('/:id', authorizeRole(['Super Admin', 'Manajer']), updateMenu);
router.delete('/:id', authorizeRole(['Super Admin', 'Manajer']), deleteMenu);

module.exports = router;
