const AdoptionApplication = require('../models/AdoptionApplication');
const Animal = require('../models/Animal');
const AuditLog = require('../models/AuditLog');

exports.submitApplication = async (req, res) => {
  try {
    const { animalId, housingType, hasOtherPets, experienceDescription } = req.body;
    if (!animalId || !housingType || !experienceDescription) {
      return res.status(400).json({ message: 'Animal ID, housing type, and experience description are required.' });
    }

    const animal = await Animal.findById(animalId);
    if (!animal) return res.status(404).json({ message: 'Animal not found.' });

    if (animal.adoptionStatus !== 'available_for_adoption') {
      return res.status(400).json({ message: 'This animal is not currently available for adoption.' });
    }

    const application = await AdoptionApplication.create({
      animal: animal._id,
      applicant: req.user._id,
      housingType,
      hasOtherPets: Boolean(hasOtherPets),
      experienceDescription
    });

    animal.adoptionStatus = 'application_pending';
    await animal.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'ADOPTION_APPLICATION_SUBMITTED',
      targetType: 'AdoptionApplication',
      targetId: application._id.toString(),
      metadata: { animalId: animal.animalId }
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit adoption application.' });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'citizen') {
      filter.applicant = req.user._id;
    }

    const applications = await AdoptionApplication.find(filter)
      .populate('animal', 'animalId species photographs location status')
      .populate('applicant', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch adoption applications.' });
  }
};

exports.reviewApplication = async (req, res) => {
  try {
    if (!['ngo', 'shelter', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only verified Organizations or Admins can review adoption applications.' });
    }

    const { status, reviewNotes } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED.' });
    }

    const application = await AdoptionApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    application.status = status;
    application.reviewNotes = reviewNotes || '';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    const animal = await Animal.findById(application.animal);
    if (animal) {
      if (status === 'APPROVED') {
        animal.status = 'adopted';
        animal.adoptionStatus = 'adopted';
      } else {
        animal.adoptionStatus = 'available_for_adoption';
      }
      await animal.save();
    }

    await AuditLog.create({
      actor: req.user._id,
      action: `ADOPTION_APPLICATION_${status}`,
      targetType: 'AdoptionApplication',
      targetId: application._id.toString(),
      metadata: { animalId: animal?.animalId, applicantId: application.applicant }
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to review adoption application.' });
  }
};
