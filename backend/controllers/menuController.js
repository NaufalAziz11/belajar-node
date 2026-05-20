const menuModel = require('../models/menuModel');

const getAllMenus = async (req, res) => {
    const { has_recipe } = req.query;
    try {
        const hasRecipeOnly = has_recipe === 'true';
        const menus = await menuModel.getMenus(hasRecipeOnly);
        res.json(menus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMenuDetails = async (req, res) => {
    try {
        const menu = await menuModel.getMenuById(req.params.id);
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createMenu = async (req, res) => {
    const { category_id, name, price, is_active } = req.body;
    try {
        const id = await menuModel.createMenu(category_id, name, price, is_active);
        res.status(201).json({ id, category_id, name, price, is_active });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateMenu = async (req, res) => {
    const { category_id, name, price, is_active } = req.body;
    try {
        const menu = await menuModel.getMenuById(req.params.id);
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        await menuModel.updateMenu(req.params.id, category_id, name, price, is_active);
        res.json({ message: 'Menu updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteMenu = async (req, res) => {
    try {
        const menu = await menuModel.getMenuById(req.params.id);
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        await menuModel.deleteMenu(req.params.id);
        res.json({ message: 'Menu deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllMenus,
    getMenuDetails,
    createMenu,
    updateMenu,
    deleteMenu
};
