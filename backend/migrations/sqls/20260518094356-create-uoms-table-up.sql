CREATE TABLE IF NOT EXISTS uoms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);
INSERT INTO uoms (name, symbol) VALUES ('Gram', 'gr'), ('Kilogram', 'kg'), ('Pieces', 'pcs'), ('Liter', 'L'), ('Mililiter', 'ml');