const pool = require('../config/database');
const axios = require('axios');
const { getAccessToken } = require('./paymentController');

// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT p.*, u.name as farmerName FROM products p JOIN users u ON p.farmerId = u.id ORDER BY p.createdAt DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT p.*, u.name as farmerName FROM products p JOIN users u ON p.farmerId = u.id WHERE p.id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create or Update Product (Farmer Only)
exports.createProduct = async (req, res) => {
    const { name, type, price, quantityInStock, description, imageUrl } = req.body;
    const allowedTypes = ['milk', 'cream', 'butter', 'ghee', 'mozzarella', 'feta', 'parmesan', 'cottage cheese'];
    
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid product category' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO products (farmerId, name, type, price, quantityInStock, description, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, price=?, quantityInStock=?, description=?, imageUrl=?',
            [req.user.id, name, type, price, quantityInStock, description, imageUrl, name, price, quantityInStock, description, imageUrl]
        );
        res.status(201).json({ message: 'Inventory updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Product (Farmer Only)
exports.updateProduct = async (req, res) => {
    const { name, type, price, quantityInStock, description, imageUrl } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ? AND farmerId = ?', [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(403).json({ message: 'You are not authorized to update this product' });

        await pool.query(
            'UPDATE products SET name = ?, type = ?, price = ?, quantityInStock = ?, description = ?, imageUrl = ? WHERE id = ?',
            [name, type, price, quantityInStock, description, imageUrl, req.params.id]
        );
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Product (Farmer Only)
exports.deleteProduct = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ? AND farmerId = ?', [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(403).json({ message: 'You are not authorized to delete this product' });

        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Order (Buyer Only)
exports.createOrder = async (req, res) => {
    const { items, totalAmount, paymentMethod, mpesaNumber } = req.body;
    const connection = await pool.getConnection();
    let mpesaCheckoutId = null;

    try {
        await connection.beginTransaction();

        // 1. Create Order in DB FIRST
        // If payment method is cash, set status to 'completed' as requested for cash on delivery invoice
        const orderStatus = (paymentMethod === 'cash') ? 'completed' : 'pending';
        
        const [orderResult] = await connection.query(
            'INSERT INTO orders (buyerId, totalAmount, payment_method, status) VALUES (?, ?, ?, ?)',
            [req.user.id, totalAmount, paymentMethod || 'mpesa', orderStatus]
        );
        const orderId = orderResult.insertId;

        // 2. Add Order Items and update stock
        for (const item of items) {
            // Check if product exists and has enough stock
            const [productRows] = await connection.query('SELECT quantityInStock, name FROM products WHERE id = ?', [item.productId]);
            if (productRows.length === 0) {
                throw new Error(`Product with ID ${item.productId} not found. Please clear your cart and try again.`);
            }

            const product = productRows[0];
            if (product.quantityInStock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Only ${product.quantityInStock} left.`);
            }

            await connection.query(
                'INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.productId, item.quantity, item.price]
            );

            await connection.query(
                'UPDATE products SET quantityInStock = quantityInStock - ? WHERE id = ?',
                [item.quantity, item.productId]
            );
        }

        // 3. If M-Pesa, trigger STK Push
        if (paymentMethod === 'mpesa') {
            try {
                // If credentials are placeholders, simulate success
                if (!process.env.MPESA_CONSUMER_KEY || 
                    process.env.MPESA_CONSUMER_KEY === 'your_consumer_key' || 
                    process.env.MPESA_CONSUMER_KEY === '') {
                    console.log('--- MPESA SIMULATION MODE ENABLED ---');
                    mpesaCheckoutId = `SIM_${Date.now()}`;
                } else {
                    const accessToken = await getAccessToken();
                    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
                    const password = Buffer.from(
                        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
                    ).toString('base64');

                    const response = await axios.post(
                        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
                        {
                            BusinessShortCode: process.env.MPESA_SHORTCODE,
                            Password: password,
                            Timestamp: timestamp,
                            TransactionType: 'CustomerPayBillOnline',
                            Amount: Math.round(totalAmount).toString(),
                            PartyA: mpesaNumber,
                            PartyB: process.env.MPESA_SHORTCODE,
                            PhoneNumber: mpesaNumber,
                            CallBackURL: `${process.env.BASE_URL}/api/payments/callback`,
                            AccountReference: `Order_${orderId}`, // Use actual orderId
                            TransactionDesc: 'Dairy Product Purchase',
                        },
                        {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        }
                    );
                    mpesaCheckoutId = response.data.CheckoutRequestID;
                }

                // Update order with checkout ID
                await connection.query(
                    'UPDATE orders SET mpesaCheckoutId = ? WHERE id = ?',
                    [mpesaCheckoutId, orderId]
                );

            } catch (mpesaErr) {
                console.error('M-Pesa push failed:', mpesaErr.message);
                // We'll keep the order as pending even if push fails, but notify user
                // Or we could rollback if we want push to be mandatory
                // For now, let's rollback to ensure order only exists if push was sent
                throw new Error(`M-Pesa initiation failed: ${mpesaErr.message}`);
            }
        }

        await connection.commit();
        res.status(201).json({ 
            id: orderId, 
            message: paymentMethod === 'mpesa' ? 'Order created and STK Push sent!' : 'Order created successfully',
            checkoutId: mpesaCheckoutId
        });
    } catch (err) {
        await connection.rollback();
        console.error('Checkout error:', err.message);
        res.status(500).json({ message: err.message });
    } finally {
        connection.release();
    }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT o.*, 
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', oi.id,
                    'name', p.name,
                    'quantity', oi.quantity,
                    'price', oi.price,
                    'imageUrl', p.imageUrl
                )
            ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.orderId
            LEFT JOIN products p ON oi.productId = p.id
            WHERE o.buyerId = ?
            GROUP BY o.id
            ORDER BY o.createdAt DESC
        `, [req.user.id]);

        // Some database drivers return JSON_ARRAYAGG as a string, others as an object
        const formattedRows = rows.map(row => {
            if (row.items && typeof row.items === 'string') {
                try {
                    row.items = JSON.parse(row.items);
                } catch (e) {
                    row.items = [];
                }
            }
            // Filter out any objects with null IDs (happens if LEFT JOIN matches nothing)
            if (Array.isArray(row.items)) {
                row.items = row.items.filter(item => item && item.id !== null);
            } else {
                row.items = [];
            }
            return row;
        });

        res.json(formattedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Check Payment Status
exports.checkPaymentStatus = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT status, payment_method FROM orders WHERE id = ? AND buyerId = ?',
            [req.params.orderId, req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
