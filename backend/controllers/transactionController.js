const transactionModel = require('../models/transactionModel');

const createPurchase = async (req, res) => {
    const { supplier_id, total_cost, items } = req.body;
    const userId = req.userId;

    if (!supplier_id || !total_cost || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Missing required purchase transaction fields.' });
    }

    try {
        const purchaseId = await transactionModel.executePurchaseTransaction(
            parseInt(supplier_id),
            userId,
            parseFloat(total_cost),
            items
        );
        res.status(201).json({
            message: 'Purchase transaction recorded successfully.',
            purchaseId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createSale = async (req, res) => {
    const { customer_name, table_number, total_price, payment_method, items } = req.body;
    const userId = req.userId;

    if (!total_price || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Missing required POS sales transaction fields.' });
    }

    try {
        const saleId = await transactionModel.executeSaleTransaction(
            userId,
            customer_name,
            table_number,
            parseFloat(total_price),
            payment_method,
            items
        );
        res.status(201).json({
            message: 'POS Sales transaction recorded successfully.',
            saleId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPurchase,
    createSale
};
