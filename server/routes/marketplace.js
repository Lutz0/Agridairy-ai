const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Public Marketplace Routes
router.get('/products', marketplaceController.getAllProducts);
router.get('/products/:id', marketplaceController.getProductById);

// Farmer Specific Product Management
router.post('/products', authMiddleware, roleMiddleware(['farmer', 'admin']), marketplaceController.createProduct);
router.put('/products/:id', authMiddleware, roleMiddleware(['farmer', 'admin']), marketplaceController.updateProduct);
router.delete('/products/:id', authMiddleware, roleMiddleware(['farmer', 'admin']), marketplaceController.deleteProduct);

// Order Management (Buyer Only)
router.post('/orders', authMiddleware, roleMiddleware(['buyer']), marketplaceController.createOrder);
router.get('/orders', authMiddleware, roleMiddleware(['buyer']), marketplaceController.getUserOrders);
router.get('/orders/:orderId/status', authMiddleware, roleMiddleware(['buyer']), marketplaceController.checkPaymentStatus);

module.exports = router;
