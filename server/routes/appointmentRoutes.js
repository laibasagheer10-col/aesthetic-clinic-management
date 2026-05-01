const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Special routes first
router.put('/:id/status', appointmentController.updateStatus);

// CRUD operations
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;