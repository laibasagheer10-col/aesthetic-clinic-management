const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Stats route must come before /:id
router.get('/stats', inventoryController.getInventoryStats);

// CRUD routes
router.post('/', inventoryController.createItem);
router.get('/', inventoryController.getAllItems);
router.put('/:id', inventoryController.updateItem);

module.exports = router;