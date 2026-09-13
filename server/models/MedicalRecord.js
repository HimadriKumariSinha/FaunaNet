const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  vet: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examination: { type: String, required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    durationDays: Number
  }],
  procedures: [{ type: String }],
  vaccinationsAdministered: [{ type: String }],
  surgeries: [{ type: String }],
  followUpDate: { type: Date },
  dischargeStatus: { 
    type: String, 
    enum: ['in_care', 'ready_for_shelter', 'released_to_wild', 'ready_for_adoption', 'deceased'], 
    default: 'in_care' 
  },
  notes: { type: String },
  attachments: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
