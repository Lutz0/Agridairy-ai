const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Cattle Routes
router.get('/cattle', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.getAllCattle);
router.get('/cattle/:id', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.getCattleById);
router.post('/cattle', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.createCattle);
router.put('/cattle/:id', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.updateCattle);
router.delete('/cattle/:id', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.deleteCattle);

// Milk Routes
router.get('/milk', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.getAllMilkRecords);
router.get('/milk/summary', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.getMilkDailySummary);
router.post('/milk', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.createMilkRecord);

// Health Routes
router.get('/health/summary', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.getHealthSummary);
router.get('/health/alerts', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.getHealthAlerts);
router.get('/health/history', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.getHealthHistory);
router.get('/health/history/:cattleId', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.getHealthHistoryByCattle);
router.post('/health/history', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.createHealthRecord);

// Dashboard Routes
router.get('/dashboard/stats', authMiddleware, roleMiddleware(['farmer', 'admin']), apiController.getDashboardStats);

module.exports = router;
