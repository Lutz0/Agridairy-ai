const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Created uploads directory');
}

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const marketplaceRoutes = require('./routes/marketplace');
const paymentRoutes = require('./routes/payment');
const uploadRoutes = require('./routes/upload');

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main API Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
const pool = require('./config/database');

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await pool.query('SELECT 1');
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
});
