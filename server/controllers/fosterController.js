const FosterApplication = require('../models/FosterApplication');
const Animal = require('../models/Animal');
const AuditLog = require('../models/AuditLog');

exports.submitApplication = async (req, res) => {
  try {
    const { animalId, housingType, hasOtherPets, durationWeeks, experienceDescription } = req.body;
    if (!animalId || !housingType || !experienceDescription) {
      return res.status(400).json({ message: 'Animal ID, housing type, and experience description are required.' });
    }

    const animal = await Animal.findById(animalId);
    if (!animal) return res.status(404).json({ message: 'Animal dossier not found.' });

    const application = await FosterApplication.create({
      animal: animal._id,
      applicant: req.user._id,
      housingType,
      hasOtherPets: Boolean(hasOtherPets),
      durationWeeks: Number(durationWeeks || 4),
      experienceDescription
    });

    animal.fosterStatus = 'application_pending';
    await animal.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'FOSTER_APPLICATION_SUBMITTED',
      targetType: 'FosterApplication',
      targetId: application._id.toString(),
      metadata: { animalId: animal.animalId }
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit foster application.' });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'citizen') {
      filter.applicant = req.user._id;
    }

    const applications = await FosterApplication.find(filter)
      .populate('animal', 'animalId species photographs location status fosterStatus')
      .populate('applicant', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch foster applications.' });
  }
};

exports.reviewApplication = async (req, res) => {
  try {
    if (!['ngo', 'shelter', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only verified Organizations or Admins can review foster applications.' });
    }

    const { status, reviewNotes } = req.body;
    if (!['APPROVED', 'PLACED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const application = await FosterApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    application.status = status;
    application.reviewNotes = reviewNotes || '';
    application.reviewedBy = req.user._id;
    if (status === 'PLACED') {
      application.startDate = new Date();
      application.endDate = new Date(Date.now() + (application.durationWeeks || 4) * 7 * 24 * 60 * 60 * 1000);
    }
    await application.save();

    const animal = await Animal.findById(application.animal);
    if (animal) {
      if (status === 'PLACED') {
        animal.fosterStatus = 'fostered';
        animal.status = 'fostered';
      } else if (status === 'REJECTED') {
        animal.fosterStatus = 'available_for_foster';
      }
      await animal.save();
    }

    await AuditLog.create({
      actor: req.user._id,
      action: `FOSTER_APPLICATION_${status}`,
      targetType: 'FosterApplication',
      targetId: application._id.toString(),
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to review foster application.' });
  }
};
