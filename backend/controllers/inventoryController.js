const inventoryModel = require('../models/inventoryModel');

// --- RAW MATERIALS ---
const getAllRawMaterials = async (req, res) => {
    try {
        const materials = await inventoryModel.getRawMaterials();
        res.json(materials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRawMaterialDetails = async (req, res) => {
    try {
        const material = await inventoryModel.getRawMaterialById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Raw material not found' });
        res.json(material);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createRawMaterial = async (req, res) => {
    const { name, uom_id, current_stock, minimum_stock } = req.body;
    try {
        const id = await inventoryModel.createRawMaterial(name, uom_id, current_stock, minimum_stock);
        res.status(201).json({ id, name, uom_id, current_stock, minimum_stock });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateRawMaterial = async (req, res) => {
    const { name, uom_id, current_stock, minimum_stock } = req.body;
    try {
        const material = await inventoryModel.getRawMaterialById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Raw material not found' });
        await inventoryModel.updateRawMaterial(req.params.id, name, uom_id, current_stock, minimum_stock);
        res.json({ message: 'Raw material updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteRawMaterial = async (req, res) => {
    try {
        const material = await inventoryModel.getRawMaterialById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Raw material not found' });
        await inventoryModel.deleteRawMaterial(req.params.id);
        res.json({ message: 'Raw material deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- RECIPES ---
const getRecipeForMenu = async (req, res) => {
    try {
        const recipe = await inventoryModel.getRecipeByMenuId(req.params.menuId);
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const saveRecipeForMenu = async (req, res) => {
    const { menuId } = req.params;
    const { items } = req.body; // Array of { raw_material_id, quantity_needed }
    try {
        // Clear previous recipe lines
        await inventoryModel.clearRecipeForMenu(menuId);
        
        // Save new recipe lines
        if (items && Array.isArray(items)) {
            for (const item of items) {
                await inventoryModel.createRecipeItem(menuId, item.raw_material_id, item.quantity_needed);
            }
        }
        res.json({ message: 'Recipe builder updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllRawMaterials,
    getRawMaterialDetails,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    getRecipeForMenu,
    saveRecipeForMenu
};
