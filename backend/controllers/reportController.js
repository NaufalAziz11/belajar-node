const reportModel = require('../models/reportModel');

const getDashboardData = async (req, res) => {
    try {
        const dailyRevenue = await reportModel.getDailyRevenue();
        const topMenus = await reportModel.getTopSellingMenus();
        const criticalStocks = await reportModel.getCriticalStockItems();
        const salesHistory = await reportModel.getSalesHistory();
        const purchasesHistory = await reportModel.getPurchasesHistory();
        const stockLedger = await reportModel.getStockLedgerLog();

        res.json({
            dailyRevenue,
            topMenus,
            criticalStocks,
            salesHistory,
            purchasesHistory,
            stockLedger
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getDashboardData
};
