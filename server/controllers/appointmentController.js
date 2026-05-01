const Appointment = require('../models/appointment/Appointment');
const Patient = require('../models/patient/Patient');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    console.log('📝 Creating appointment with data:', req.body);
    
    // Validate required fields
    if (!req.body.patientId) {
      return res.status(400).json({ 
        error: "Patient is required" 
      });
    }
    
    if (!req.body.appointmentDate && !req.body.date) {
      return res.status(400).json({ 
        error: "Date is required" 
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(req.body.patientId);
    if (!patient) {
      return res.status(404).json({ 
        error: "Patient not found" 
      });
    }

    // Handle date field (frontend sends 'date', backend expects 'appointmentDate')
    const appointmentDate = req.body.appointmentDate || req.body.date;
    
    // Create appointment data
    const appointmentData = {
      patientId: req.body.patientId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime: req.body.appointmentTime || '',
      status: req.body.status || 'Pending',
      paymentStatus: req.body.paymentStatus || 'Unpaid',
      notes: req.body.notes || '',
      // Optional fields - set to null if not provided
      doctorId: req.body.doctorId || null,
      treatmentId: req.body.treatmentId || null
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();
    
    // Populate patient details for response
    await appointment.populate('patientId');
    
    console.log('✅ Appointment created:', appointment._id);
    res.status(201).json(appointment);
    
  } catch (error) {
    console.error('❌ Create appointment error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: messages 
      });
    }
    
    res.status(500).json({ 
      error: error.message || "Server error. Please try again later." 
    });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId')
      .sort({ appointmentDate: -1 })
      .lean();
    
    // Format appointments for frontend
    const formattedAppointments = appointments.map(app => ({
      _id: app._id,
      patientId: app.patientId?._id,
      patientName: app.patientId?.name || 'Unknown',
      patientPhone: app.patientId?.phone || '',
      date: app.appointmentDate,
      appointmentDate: app.appointmentDate,
      appointmentTime: app.appointmentTime,
      status: app.status,
      paymentStatus: app.paymentStatus,
      notes: app.notes,
      createdAt: app.createdAt
    }));
    
    console.log(`📋 Found ${formattedAppointments.length} appointments`);
    res.json(formattedAppointments);
    
  } catch (error) {
    console.error('❌ Get appointments error:', error);
    res.status(500).json({ 
      error: error.message || "Server error. Please try again later." 
    });
  }
};

// Get single appointment
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .lean();
    
    if (!appointment) {
      return res.status(404).json({ 
        error: "Appointment not found" 
      });
    }
    
    const formattedAppointment = {
      _id: appointment._id,
      patientId: appointment.patientId?._id,
      patientName: appointment.patientId?.name || 'Unknown',
      patientPhone: appointment.patientId?.phone || '',
      date: appointment.appointmentDate,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      paymentStatus: appointment.paymentStatus,
      notes: appointment.notes
    };
    
    res.json(formattedAppointment);
    
  } catch (error) {
    console.error('❌ Get appointment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    // Handle date field mapping
    const updateData = { ...req.body };
    if (updateData.date && !updateData.appointmentDate) {
      updateData.appointmentDate = new Date(updateData.date);
      delete updateData.date;
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('patientId');
    
    if (!appointment) {
      return res.status(404).json({ 
        error: "Appointment not found" 
      });
    }
    
    const formattedAppointment = {
      _id: appointment._id,
      patientId: appointment.patientId?._id,
      patientName: appointment.patientId?.name || 'Unknown',
      patientPhone: appointment.patientId?.phone || '',
      date: appointment.appointmentDate,
      status: appointment.status,
      notes: appointment.notes
    };
    
    console.log('✅ Appointment updated:', appointment._id);
    res.json(formattedAppointment);
    
  } catch (error) {
    console.error('❌ Update appointment error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: messages 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ 
        error: "Appointment not found" 
      });
    }
    
    console.log('✅ Appointment deleted:', req.params.id);
    res.json({ message: "Appointment deleted successfully" });
    
  } catch (error) {
    console.error('❌ Delete appointment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update appointment status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        error: "Status is required" 
      });
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { 
        new: true,
        runValidators: true 
      }
    ).populate('patientId');
    
    if (!appointment) {
      return res.status(404).json({ 
        error: "Appointment not found" 
      });
    }
    
    const formattedAppointment = {
      _id: appointment._id,
      patientId: appointment.patientId?._id,
      patientName: appointment.patientId?.name || 'Unknown',
      patientPhone: appointment.patientId?.phone || '',
      date: appointment.appointmentDate,
      status: appointment.status
    };
    
    console.log('✅ Appointment status updated:', appointment._id);
    res.json(formattedAppointment);
    
  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({ error: error.message });
  }
};