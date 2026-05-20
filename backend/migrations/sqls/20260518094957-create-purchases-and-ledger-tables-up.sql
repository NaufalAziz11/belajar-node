CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    user_id INT NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    purchase_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_purchases_suppliers FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_purchases_users FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS purchase_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    raw_material_id INT NOT NULL,
    quantity_bought DECIMAL(10,2) NOT NULL,
    price_per_unit DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_purchase_details_purchases FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    CONSTRAINT fk_purchase_details_raw_materials FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);

CREATE TABLE IF NOT EXISTS stock_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    raw_material_id INT NOT NULL,
    transaction_type ENUM('IN_PURCHASE', 'OUT_SALE', 'ADJ_OPNAME') NOT NULL,
    reference_id INT NULL,
    qty_change DECIMAL(10,2) NOT NULL,
    final_stock DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_stock_ledger_raw_materials FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);