const mongoose = require('mongoose');

const lostFoundReportSchema = new mongoose.Schema({
  type: { type: String, enum: ['LOST', 'FOUND'], required: true },
  species: { 
    type: String, 
    enum: ['dog', 'cat', 'cow', 'bull', 'goat', 'pig', 'bird', 'monkey', 'wildlife', 'other'], 
    required: true 
  },
  petName: { type: String },
  photos: [{ type: String }],
  lastSeenLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String },
    city: { type: String }
  },
  lastSeenTime: { type: Date, default: Date.now },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  identifyingMarks: { type: String },
  status: { type: String, enum: ['ACTIVE', 'MATCHED', 'RESOLVED'], default: 'ACTIVE' },
  matchedReport: { type: mongoose.Schema.Types.ObjectId, ref: 'LostFoundReport' },
  linkedAnimal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('LostFoundReport', lostFoundReportSchema);
