CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_id INT NOT NULL,
    raw_material_id INT NOT NULL,
    quantity_needed DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_recipes_menus FOREIGN KEY (menu_id) REFERENCES menus(id),
    CONSTRAINT fk_recipes_raw_materials FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);