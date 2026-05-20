const db = require('./config/db');
const { executePurchaseTransaction, executeSaleTransaction } = require('./models/transactionModel');

const seed = async () => {
    console.log('=== MEMULAI SEEDING DATA SIMULASI BISNIS ===');
    
    try {
        // 1. Matikan Foreign Key Checks & Truncate tabel bisnis
        await db.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        const tablesToClear = [
            'stock_ledger',
            'purchase_details',
            'purchases',
            'sale_details',
            'sales',
            'recipes',
            'menus',
            'raw_materials',
            'categories',
            'suppliers',
            'uoms'
        ];
        
        for (const table of tablesToClear) {
            console.log(`Clearing table: ${table}...`);
            await db.execute(`TRUNCATE TABLE ${table}`);
        }
        
        await db.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Tabel bisnis berhasil dibersihkan (User dan Role tetap aman).');

        // 2. Ambil User ID pertama untuk referensi pencatat transaksi
        const [users] = await db.execute('SELECT id FROM users LIMIT 1');
        if (users.length === 0) {
            throw new Error('Tidak ada user terdaftar. Silakan registrasi terlebih dahulu via aplikasi.');
        }
        const userId = users[0].id;
        console.log(`Menggunakan User ID: ${userId} sebagai operator.`);

        // 3. Insert UOMs (Satuan)
        console.log('Inserting UoMs...');
        const [uomGr] = await db.execute("INSERT INTO uoms (name, symbol) VALUES ('Gram', 'gr')");
        const [uomMl] = await db.execute("INSERT INTO uoms (name, symbol) VALUES ('Mililiter', 'ml')");
        const [uomPcs] = await db.execute("INSERT INTO uoms (name, symbol) VALUES ('Piece', 'pcs')");
        
        const grId = uomGr.insertId;
        const mlId = uomMl.insertId;
        const pcsId = uomPcs.insertId;

        // 4. Insert Suppliers
        console.log('Inserting Suppliers...');
        const [supIndo] = await db.execute("INSERT INTO suppliers (name, phone, address) VALUES ('Indogrosir Utama', '0812345678', 'Kawasan Industri Jakarta')");
        const [supPasar] = await db.execute("INSERT INTO suppliers (name, phone, address) VALUES ('Pasar Segar Jaya', '0898765432', 'Pasar Induk Kramat Jati')");
        
        const supplierIndoId = supIndo.insertId;
        const supplierPasarId = supPasar.insertId;

        // 5. Insert Categories
        console.log('Inserting Categories...');
        const [catFood] = await db.execute("INSERT INTO categories (name) VALUES ('Makanan Berat')");
        const [catCoffee] = await db.execute("INSERT INTO categories (name) VALUES ('Minuman Kopi')");
        const [catTea] = await db.execute("INSERT INTO categories (name) VALUES ('Minuman Teh')");
        
        const foodCatId = catFood.insertId;
        const coffeeCatId = catCoffee.insertId;
        const teaCatId = catTea.insertId;

        // 6. Insert Raw Materials (Bahan Baku)
        console.log('Inserting Raw Materials...');
        
        const insertMaterial = async (name, uomId, minStock) => {
            const [res] = await db.execute(
                'INSERT INTO raw_materials (name, uom_id, current_stock, minimum_stock, average_cost) VALUES (?, ?, 0.00, ?, 0.00)',
                [name, uomId, minStock]
            );
            return res.insertId;
        };

        const berasId = await insertMaterial('Beras Premium', grId, 5000);
        const sosisId = await insertMaterial('Sosis Sapi Jumbo', pcsId, 20);
        const kopiId = await insertMaterial('Kopi Espresso Blend', grId, 1000);
        const susuId = await insertMaterial('Susu Fresh Milk', mlId, 2000);
        const arenId = await insertMaterial('Sirup Aren Murni', mlId, 1000);
        const tehId = await insertMaterial('Teh Celup Melati', pcsId, 50);
        const minyakId = await insertMaterial('Minyak Goreng Bimoli', mlId, 2000);
        const gelasId = await insertMaterial('Gelas Plastik & Sedotan', pcsId, 100);

        // 7. Insert Menus
        console.log('Inserting Menus...');
        const insertMenu = async (name, categoryId, price) => {
            const [res] = await db.execute(
                'INSERT INTO menus (name, category_id, price) VALUES (?, ?, ?)',
                [name, categoryId, price]
            );
            return res.insertId;
        };

        const nasgorId = await insertMenu('Nasi Goreng Sosis', foodCatId, 25000);
        const kopsusId = await insertMenu('Kopi Susu Aren', coffeeCatId, 18000);
        const estehId = await insertMenu('Es Teh Manis', teaCatId, 6000);

        // 8. Insert Recipes (BoM)
        console.log('Inserting Recipes (BoM)...');
        const insertRecipeItem = async (menuId, materialId, qty) => {
            await db.execute(
                'INSERT INTO recipes (menu_id, raw_material_id, quantity_needed) VALUES (?, ?, ?)',
                [menuId, materialId, qty]
            );
        };

        // Nasi Goreng Sosis
        await insertRecipeItem(nasgorId, berasId, 150); // 150gr Beras
        await insertRecipeItem(nasgorId, sosisId, 2);   // 2 Pcs Sosis
        await insertRecipeItem(nasgorId, minyakId, 20); // 20ml Minyak

        // Kopi Susu Aren
        await insertRecipeItem(kopsusId, kopiId, 15);   // 15gr Kopi
        await insertRecipeItem(kopsusId, susuId, 120);  // 120ml Susu
        await insertRecipeItem(kopsusId, arenId, 25);   // 25ml Aren
        await insertRecipeItem(kopsusId, gelasId, 1);   // 1 Pcs Gelas

        // Es Teh Manis
        await insertRecipeItem(estehId, tehId, 1);      // 1 Pcs Teh Celup
        await insertRecipeItem(estehId, gelasId, 1);    // 1 Pcs Gelas

        console.log('Struktur Gudang, Menu, dan Resep sukses dikonfigurasi!');

        // 9. Jalankan transaksi pembelian untuk mensimulasikan pasokan bahan (SUPPLY)
        console.log('Menjalankan Simulasi Transaksi Pembelian Supplier (Supply)...');
        
        // Pembelian 1: Dari Indogrosir Utama (Kelontong, Kopi, Kemasan)
        const purchaseItemsIndo = [
            { raw_material_id: berasId, quantity_bought: 20000, price_per_unit: 15 },       // 20 Kg @ Rp 15/gr (Rp 15.000/kg)
            { raw_material_id: kopiId, quantity_bought: 5000, price_per_unit: 180 },        // 5 Kg @ Rp 180/gr (Rp 180.000/kg)
            { raw_material_id: susuId, quantity_bought: 10000, price_per_unit: 25 },        // 10 Liter @ Rp 25/ml (Rp 25.000/liter)
            { raw_material_id: arenId, quantity_bought: 5000, price_per_unit: 20 },         // 5 Liter @ Rp 20/ml (Rp 20.000/liter)
            { raw_material_id: gelasId, quantity_bought: 500, price_per_unit: 400 }          // 500 Pcs @ Rp 400/pcs
        ];
        const costIndo = purchaseItemsIndo.reduce((acc, curr) => acc + (curr.quantity_bought * curr.price_per_unit), 0);
        await executePurchaseTransaction(supplierIndoId, userId, costIndo, purchaseItemsIndo);

        // Pembelian 2: Dari Pasar Segar Jaya (Bahan basah segar & sosis)
        const purchaseItemsPasar = [
            { raw_material_id: sosisId, quantity_bought: 100, price_per_unit: 2000 },       // 100 Pcs @ Rp 2.000/pcs
            { raw_material_id: tehId, quantity_bought: 200, price_per_unit: 500 },          // 200 Pcs @ Rp 500/pcs
            { raw_material_id: minyakId, quantity_bought: 10000, price_per_unit: 18 }       // 10 Liter @ Rp 18/ml (Rp 18.000/liter)
        ];
        const costPasar = purchaseItemsPasar.reduce((acc, curr) => acc + (curr.quantity_bought * curr.price_per_unit), 0);
        await executePurchaseTransaction(supplierPasarId, userId, costPasar, purchaseItemsPasar);
        
        console.log('Simulasi Belanja Bahan Baku dari Pemasok berhasil direkam!');

        // 10. Jalankan transaksi penjualan POS Kasir untuk mensimulasikan penjualan hidangan
        console.log('Menjalankan Simulasi Transaksi Penjualan Pelanggan (POS)...');
        
        // Transaksi Penjualan 1: Budi (Meja 5)
        // Beli: 2x Kopi Susu Aren, 1x Nasi Goreng Sosis
        const saleItems1 = [
            { menu_id: kopsusId, quantity: 2, subtotal: 36000 },
            { menu_id: nasgorId, quantity: 1, subtotal: 25000 }
        ];
        const totalSale1 = 61000;
        await executeSaleTransaction(userId, 'Budi', '5', totalSale1, 'QRIS', saleItems1);

        // Transaksi Penjualan 2: Dewi (Meja 12)
        // Beli: 1x Es Teh Manis, 1x Nasi Goreng Sosis
        const saleItems2 = [
            { menu_id: estehId, quantity: 1, subtotal: 6000 },
            { menu_id: nasgorId, quantity: 1, subtotal: 25000 }
        ];
        const totalSale2 = 31000;
        await executeSaleTransaction(userId, 'Dewi', '12', totalSale2, 'CASH', saleItems2);

        console.log('Simulasi Penjualan POS Kasir berhasil direkam!');
        console.log('=== SEEDING SELESAI DENGAN SUKSES! ===');
        process.exit(0);
    } catch (error) {
        console.error('Terjadi kesalahan saat seeding data:', error);
        process.exit(1);
    }
};

seed();
