const MedicalRecord = require('../models/MedicalRecord');
const Animal = require('../models/Animal');
const AuditLog = require('../models/AuditLog');

exports.createMedicalRecord = async (req, res) => {
  try {
    // Role verification guard: Only VET or NGO role allowed
    if (!['vet', 'ngo'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only verified Veterinarians or NGOs can create medical treatment records.' });
    }

    const { animalId, taskId, examination, diagnosis, treatment, medications, procedures, vaccinationsAdministered, surgeries, followUpDate, dischargeStatus, notes } = req.body;

    if (!animalId || !examination || !diagnosis || !treatment) {
      return res.status(400).json({ message: 'Animal ID, examination, diagnosis, and treatment are required.' });
    }

    // Verify animal exists
    const animal = await Animal.findOne({ $or: [{ _id: animalId }, { animalId }] });
    if (!animal) return res.status(404).json({ message: 'Animal dossier not found.' });

    const record = await MedicalRecord.create({
      animal: animal._id,
      task: taskId || null,
      vet: req.user._id,
      examination,
      diagnosis,
      treatment,
      medications: medications || [],
      procedures: procedures || [],
      vaccinationsAdministered: vaccinationsAdministered || [],
      surgeries: surgeries || [],
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      dischargeStatus: dischargeStatus || 'in_care',
      notes: notes || ''
    });

    // Update animal status based on discharge state
    if (dischargeStatus === 'ready_for_shelter' || dischargeStatus === 'in_care') {
      animal.status = 'under_treatment';
    } else if (dischargeStatus === 'released_to_wild') {
      animal.status = 'released';
    } else if (dischargeStatus === 'ready_for_adoption') {
      animal.status = 'available_for_adoption';
      animal.adoptionStatus = 'available_for_adoption';
    }
    await animal.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'MEDICAL_RECORD_CREATED',
      targetType: 'MedicalRecord',
      targetId: record._id.toString(),
      metadata: { animalId: animal.animalId, diagnosis }
    });

    const populated = await MedicalRecord.findById(record._id)
      .populate('vet', 'name email role')
      .populate('animal', 'animalId species photographs');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create medical record.' });
  }
};

exports.getMedicalRecordsByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;
    const animal = await Animal.findOne({ $or: [{ _id: animalId }, { animalId }] });
    if (!animal) return res.status(404).json({ message: 'Animal dossier not found.' });

    const records = await MedicalRecord.find({ animal: animal._id })
      .populate('vet', 'name email role')
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch medical records.' });
  }
};

exports.getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('vet', 'name email role')
      .populate('animal', 'animalId species photographs location status')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch medical records.' });
  }
};
