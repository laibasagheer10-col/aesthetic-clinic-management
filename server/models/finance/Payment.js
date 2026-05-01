const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash','Card','Easypaisa','JazzCash'], required: true },
  transactionId: { type: String },
  status: { type: String, enum: ['Success','Failed','Pending'], default: 'Pending' },
  paymentDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);