const mongoose = require('mongoose');

const adoptionApplicationSchema = new mongoose.Schema({
  animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  housingType: { type: String, required: true },
  hasOtherPets: { type: Boolean, default: false },
  experienceDescription: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  reviewNotes: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('AdoptionApplication', adoptionApplicationSchema);
