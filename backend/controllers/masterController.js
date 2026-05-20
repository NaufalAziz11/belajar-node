const masterModel = require('../models/masterModel');

// --- ROLES ---
const getAllRoles = async (req, res) => {
    try {
        const roles = await masterModel.getRoles();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- UOMS ---
const getAllUoms = async (req, res) => {
    try {
        const uoms = await masterModel.getUoms();
        res.json(uoms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUomDetails = async (req, res) => {
    try {
        const uom = await masterModel.getUomById(req.params.id);
        if (!uom) return res.status(404).json({ message: 'UoM not found' });
        res.json(uom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createUom = async (req, res) => {
    const { name, symbol } = req.body;
    try {
        const id = await masterModel.createUom(name, symbol);
        res.status(201).json({ id, name, symbol });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUom = async (req, res) => {
    const { name, symbol } = req.body;
    try {
        const uom = await masterModel.getUomById(req.params.id);
        if (!uom) return res.status(404).json({ message: 'UoM not found' });
        await masterModel.updateUom(req.params.id, name, symbol);
        res.json({ message: 'UoM updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUom = async (req, res) => {
    try {
        const uom = await masterModel.getUomById(req.params.id);
        if (!uom) return res.status(404).json({ message: 'UoM not found' });
        await masterModel.deleteUom(req.params.id);
        res.json({ message: 'UoM deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- SUPPLIERS ---
const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await masterModel.getSuppliers();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSupplierDetails = async (req, res) => {
    try {
        const supplier = await masterModel.getSupplierById(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createSupplier = async (req, res) => {
    const { name, phone, address } = req.body;
    try {
        const id = await masterModel.createSupplier(name, phone, address);
        res.status(201).json({ id, name, phone, address });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateSupplier = async (req, res) => {
    const { name, phone, address } = req.body;
    try {
        const supplier = await masterModel.getSupplierById(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        await masterModel.updateSupplier(req.params.id, name, phone, address);
        res.json({ message: 'Supplier updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const supplier = await masterModel.getSupplierById(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        await masterModel.deleteSupplier(req.params.id);
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- CATEGORIES ---
const getAllCategories = async (req, res) => {
    try {
        const categories = await masterModel.getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCategoryDetails = async (req, res) => {
    try {
        const category = await masterModel.getCategoryById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const id = await masterModel.createCategory(name);
        res.status(201).json({ id, name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const category = await masterModel.getCategoryById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        await masterModel.updateCategory(req.params.id, name);
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await masterModel.getCategoryById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        await masterModel.deleteCategory(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
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
};
