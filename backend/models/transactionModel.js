const db = require('../config/db');

/**
 * Creates a purchase transaction.
 */
const executePurchaseTransaction = async (supplierId, userId, totalCost, items) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [purchaseResult] = await conn.execute(
            'INSERT INTO purchases (supplier_id, user_id, total_cost) VALUES (?, ?, ?)',
            [supplierId, userId, totalCost]
        );
        const purchaseId = purchaseResult.insertId;

        for (const item of items) {
            const { raw_material_id, quantity_bought, price_per_unit } = item;

            await conn.execute(
                'INSERT INTO purchase_details (purchase_id, raw_material_id, quantity_bought, price_per_unit) VALUES (?, ?, ?, ?)',
                [purchaseId, raw_material_id, quantity_bought, price_per_unit]
            );

            // Fetch old stock and average cost to calculate Moving Average Cost (MAC)
            const [materialRows] = await conn.execute(
                'SELECT current_stock, average_cost FROM raw_materials WHERE id = ? FOR UPDATE',
                [raw_material_id]
            );
            if (materialRows.length === 0) {
                throw new Error(`Raw material ID ${raw_material_id} not found.`);
            }

            const currentStockOld = parseFloat(materialRows[0].current_stock);
            const averageCostOld = parseFloat(materialRows[0].average_cost || 0);
            const qtyBought = parseFloat(quantity_bought);
            const pricePaid = parseFloat(price_per_unit);

            let newAverageCost = pricePaid;
            if (currentStockOld > 0) {
                newAverageCost = ((currentStockOld * averageCostOld) + (qtyBought * pricePaid)) / (currentStockOld + qtyBought);
            }

            const finalStock = currentStockOld + qtyBought;

            await conn.execute(
                'UPDATE raw_materials SET current_stock = ?, average_cost = ? WHERE id = ?',
                [finalStock, newAverageCost, raw_material_id]
            );

            await conn.execute(
                'INSERT INTO stock_ledger (raw_material_id, transaction_type, reference_id, qty_change, final_stock) VALUES (?, "IN_PURCHASE", ?, ?, ?)',
                [raw_material_id, purchaseId, quantity_bought, finalStock]
            );
        }

        await conn.commit();
        return purchaseId;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * Executes a POS sales transaction.
 * Deducts raw material stock dynamically using recipe quantities multiplied by portions sold.
 * Records COGS (Harga Pokok Penjualan) per sale item based on recipe raw material average costs.
 * Uses a FOR UPDATE transaction for extreme data integrity.
 */
const executeSaleTransaction = async (userId, customerName, tableNumber, totalPrice, paymentMethod, items) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Insert Sales Header (with total_cogs initialized to 0)
        const [saleResult] = await conn.execute(
            'INSERT INTO sales (user_id, customer_name, table_number, total_price, payment_method, total_cogs) VALUES (?, ?, ?, ?, ?, 0.00)',
            [userId, customerName || null, tableNumber || null, totalPrice, paymentMethod || 'CASH']
        );
        const saleId = saleResult.insertId;

        let totalInvoiceCogs = 0;

        // 2. Loop Sale Items
        for (const item of items) {
            const { menu_id, quantity, subtotal } = item;

            // 3. Resolve Ingredients via Recipe (BoM)
            const [recipeRows] = await conn.execute(
                'SELECT raw_material_id, quantity_needed FROM recipes WHERE menu_id = ? AND deleted_at IS NULL',
                [menu_id]
            );

            let itemCogsPerUnit = 0;

            // Deduct each ingredient
            for (const recipe of recipeRows) {
                const { raw_material_id, quantity_needed } = recipe;
                const totalDeducted = parseFloat(quantity_needed) * parseInt(quantity);

                // Fetch current stock and average cost with lock
                const [materialRows] = await conn.execute(
                    'SELECT current_stock, average_cost FROM raw_materials WHERE id = ? FOR UPDATE',
                    [raw_material_id]
                );
                if (materialRows.length === 0) {
                    throw new Error(`Raw material ID ${raw_material_id} in menu recipe not found.`);
                }

                const currentStock = parseFloat(materialRows[0].current_stock);
                const averageCost = parseFloat(materialRows[0].average_cost || 0);
                const finalStock = currentStock - totalDeducted;

                // Update stock
                await conn.execute(
                    'UPDATE raw_materials SET current_stock = ? WHERE id = ?',
                    [finalStock, raw_material_id]
                );

                // Record stock ledger
                await conn.execute(
                    'INSERT INTO stock_ledger (raw_material_id, transaction_type, reference_id, qty_change, final_stock) VALUES (?, "OUT_SALE", ?, ?, ?)',
                    [raw_material_id, saleId, -totalDeducted, finalStock]
                );

                // Accumulate cost
                itemCogsPerUnit += parseFloat(quantity_needed) * averageCost;
            }

            const itemCogsTotal = itemCogsPerUnit * parseInt(quantity);
            totalInvoiceCogs += itemCogsTotal;

            // Insert Detail with calculated cogs
            await conn.execute(
                'INSERT INTO sale_details (sale_id, menu_id, quantity, subtotal, cogs) VALUES (?, ?, ?, ?, ?)',
                [saleId, menu_id, quantity, subtotal, itemCogsTotal]
            );
        }

        // 4. Update the sales header with the final total cogs
        await conn.execute(
            'UPDATE sales SET total_cogs = ? WHERE id = ?',
            [totalInvoiceCogs, saleId]
        );

        await conn.commit();
        return saleId;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

module.exports = {
    executePurchaseTransaction,
    executeSaleTransaction
};
