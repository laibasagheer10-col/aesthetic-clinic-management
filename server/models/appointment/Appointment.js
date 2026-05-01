const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  doctorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: false // Changed to false temporarily
  },
  treatmentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Treatment', 
    required: false // Changed to false temporarily
  },
  appointmentDate: { 
    type: Date, 
    required: true 
  },
  appointmentTime: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No Show'], 
    default: 'Pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Unpaid'], 
    default: 'Unpaid' 
  },
  notes: { 
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);