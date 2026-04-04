const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
    const { name, username, email, password, role, phone } = req.body;
    console.log(`Registration attempt: ${username} (${email})`);

    try {
        // Validate input
        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check for existing user by email or username
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUser.length > 0) {
            const field = existingUser[0].email === email ? 'Email' : 'Username';
            console.log(`Registration failed: ${field} already exists`);
            return res.status(400).json({ message: `${field} already exists` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (name, username, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [name, username, email, hashedPassword, role || 'farmer', phone]
        );

        const token = jwt.sign(
            { id: result.insertId, role: role || 'farmer', paymentStatus: 'unpaid' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        console.log(`Registration successful for: ${username}`);
        res.status(201).json({ 
            token, 
            user: { id: result.insertId, name, username, email, role: role || 'farmer', paymentStatus: 'unpaid' } 
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
};

// Login User
exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);

    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            console.log(`Login failed: User ${username} not found`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login failed: Incorrect password for ${username}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, paymentStatus: user.paymentStatus },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        console.log(`Login successful: ${username}`);
        res.json({ 
            token, 
            user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role, paymentStatus: user.paymentStatus } 
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error during login', error: err.message });
    }
};

// Get Current User Profile
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, username, email, role, phone, profile_pic, paymentStatus FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Profile Fetch Error:', err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    const { name, email, phone, profile_pic } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = ?, email = ?, phone = ?, profile_pic = ? WHERE id = ?',
            [name, email, phone, profile_pic, req.user.id]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Profile Update Error:', err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// Admin: Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, username, email, role, phone, paymentStatus, createdAt FROM users ORDER BY createdAt DESC');
        res.json(rows);
    } catch (err) {
        console.error('Admin Get Users Error:', err);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// Admin: Update User
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, role, paymentStatus } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = ?, role = ?, paymentStatus = ? WHERE id = ?',
            [name, role, paymentStatus, id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Admin Update User Error:', err);
        res.status(500).json({ message: 'Server error updating user' });
    }
};

// Admin: Delete User
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Don't allow admin to delete themselves
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Admin Delete User Error:', err);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const user = rows[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Password Change Error:', err);
        res.status(500).json({ message: 'Server error changing password' });
    }
};

// Simulate Mpesa Payment for Access Fee
exports.payAccessFee = async (req, res) => {
    const { phoneNumber, amount } = req.body;
    // Simulate Mpesa STK Push and callback
    try {
        // In real life, you'd call Safaricom API here
        console.log(`Simulating Mpesa payment for ${req.user.id} at ${phoneNumber} for amount ${amount}`);
        
        await pool.query('UPDATE users SET paymentStatus = \'paid\' WHERE id = ?', [req.user.id]);
        
        // Since paymentStatus changed, the client should ideally refresh the token
        res.json({ message: 'Access fee paid successfully. Please re-login to activate premium features.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
