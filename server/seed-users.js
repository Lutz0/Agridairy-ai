const pool = require('./config/database');
const bcrypt = require('bcryptjs');

const usersData = [
    ['Admin User', 'admin', 'admin@taboraagridairy.com', 'admin123', 'admin', '1234567890', 'paid'],
    ['Farmer Joe', 'farmerjoe', 'joe@taboraagridairy.com', 'farmer123', 'farmer', '0987654321', 'paid'],
    ['Buyer Alice', 'buyeralice', 'alice@taboraagridairy.com', 'buyer123', 'buyer', '1122334455', 'unpaid']
];

const seedUsers = async () => {
    try {
        console.log('Seeding users...');
        
        // Clear existing users
        await pool.query('DELETE FROM users');
        
        for (const [name, username, email, password, role, phone, paymentStatus] of usersData) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                'INSERT INTO users (name, username, email, password, role, phone, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, username, email, hashedPassword, role, phone, paymentStatus]
            );
            console.log(`Created user: ${username} with role: ${role} and status: ${paymentStatus}`);
        }

        console.log('Users seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding users:', err);
        process.exit(1);
    }
};

seedUsers();
