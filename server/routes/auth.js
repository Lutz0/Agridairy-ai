const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);
router.post('/pay-access-fee', authMiddleware, authController.payAccessFee);

// Admin User Management Routes
router.get('/users', authMiddleware, roleMiddleware(['admin']), authController.getAllUsers);
router.put('/users/:id', authMiddleware, roleMiddleware(['admin']), authController.updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), authController.deleteUser);

module.exports = router;
