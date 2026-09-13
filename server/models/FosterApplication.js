const mongoose = require('mongoose');

const fosterApplicationSchema = new mongoose.Schema({
  animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  housingType: { type: String, required: true },
  hasOtherPets: { type: Boolean, default: false },
  durationWeeks: { type: Number, required: true, default: 4 },
  experienceDescription: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'PLACED', 'COMPLETED', 'REJECTED'], 
    default: 'PENDING' 
  },
  reviewNotes: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('FosterApplication', fosterApplicationSchema);
