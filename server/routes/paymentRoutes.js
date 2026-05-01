// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// GET /api/payments/stats - Get payment statistics (must be before /:id)
router.get('/stats', paymentController.getPaymentStats);

// CRUD operations
router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;