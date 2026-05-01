// server/routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.post('/from-payment/:paymentId', invoiceController.generateInvoiceFromPayment);
router.get('/:id/download', invoiceController.downloadInvoicePDF);

module.exports = router;