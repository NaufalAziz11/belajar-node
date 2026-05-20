const db = require('./config/db');
const bcrypt = require('bcrypt');

const seedUsers = async () => {
    console.log('=== MEMULAI SEEDING USER TEST ROLE ===');
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // 1. Get role IDs
        const [roles] = await db.execute('SELECT * FROM roles');
        console.log('Available roles in DB:', roles);
        
        const superAdminRole = roles.find(r => r.name === 'Super Admin');
        const kasirRole = roles.find(r => r.name === 'Kasir');
        const gudangRole = roles.find(r => r.name === 'Gudang');
        const manajerRole = roles.find(r => r.name === 'Manajer');
        
        if (!superAdminRole || !kasirRole || !gudangRole || !manajerRole) {
            console.error('Error: Some required roles are missing. Please run database migrations first.');
            process.exit(1);
        }

        const usersToSeed = [
            { username: 'superadmin', email: 'superadmin@resto.com', role_id: superAdminRole.id },
            { username: 'manager', email: 'manager@resto.com', role_id: manajerRole.id },
            { username: 'gudang', email: 'gudang@resto.com', role_id: gudangRole.id },
            { username: 'kasir', email: 'kasir@resto.com', role_id: kasirRole.id }
        ];

        for (const u of usersToSeed) {
            // Check if user already exists
            const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [u.email]);
            if (existing.length === 0) {
                console.log(`Inserting test user: ${u.username} (${u.email}) with role_id ${u.role_id}`);
                await db.execute(
                    'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
                    [u.username, u.email, hashedPassword, u.role_id]
                );
            } else {
                console.log(`User ${u.username} already exists, updating role_id to ${u.role_id}`);
                await db.execute(
                    'UPDATE users SET role_id = ?, deleted_at = NULL WHERE id = ?',
                    [u.role_id, existing[0].id]
                );
            }
        }

        console.log('=== SEEDING USER BERHASIL! ===');
        process.exit(0);
    } catch (err) {
        console.error('Terjadi kesalahan saat seeding user:', err);
        process.exit(1);
    }
};

seedUsers();
