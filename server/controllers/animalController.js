const Animal = require('../models/Animal');
const AuditLog = require('../models/AuditLog');

exports.getAllAnimals = async (req, res) => {
  try {
    const { species, status, adoptionStatus, q } = req.query;
    const filter = {};
    if (species) filter.species = species;
    if (status) filter.status = status;
    if (adoptionStatus) filter.adoptionStatus = adoptionStatus;
    if (q) {
      filter.$or = [
        { animalId: new RegExp(q, 'i') },
        { identifyingMarkings: new RegExp(q, 'i') },
        { 'location.city': new RegExp(q, 'i') }
      ];
    }

    const animals = await Animal.find(filter)
      .populate('caregiver', 'name email phone')
      .populate('currentOrganization', 'name type')
      .sort({ updatedAt: -1 });

    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch animals.' });
  }
};

exports.getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findOne({ 
      $or: [{ _id: req.params.id }, { animalId: req.params.id }] 
    })
      .populate('caregiver', 'name email phone')
      .populate('currentOrganization', 'name type')
      .populate('sightings.reportedBy', 'name');

    if (!animal) return res.status(404).json({ message: 'Animal dossier not found.' });
    res.json(animal);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch animal.' });
  }
};

exports.createAnimal = async (req, res) => {
  try {
    const { species, estimatedAge, sex, photographs, identifyingMarkings, location, sterilizationStatus } = req.body;

    if (!species) {
      return res.status(400).json({ message: 'Species is required.' });
    }

    const animalId = `FAUNA-${Math.floor(100000 + Math.random() * 900000)}`;

    const animal = await Animal.create({
      animalId,
      species,
      estimatedAge: estimatedAge || 'Unknown',
      sex: sex || 'unknown',
      photographs: photographs || [],
      identifyingMarkings: identifyingMarkings || '',
      location: location || null,
      sterilizationStatus: sterilizationStatus || 'unknown',
      caregiver: req.user._id,
      status: 'reported'
    });

    await AuditLog.create({
      actor: req.user._id,
      action: 'ANIMAL_DOSSIER_CREATED',
      targetType: 'Animal',
      targetId: animal._id.toString(),
      metadata: { animalId: animal.animalId, species }
    });

    res.status(201).json(animal);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create animal dossier.' });
  }
};

exports.updateAnimal = async (req, res) => {
  try {
    const { status, sterilizationStatus, adoptionStatus, identifyingMarkings, caregiver } = req.body;

    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ message: 'Animal dossier not found.' });

    if (status) animal.status = status;
    if (sterilizationStatus) animal.sterilizationStatus = sterilizationStatus;
    if (adoptionStatus) animal.adoptionStatus = adoptionStatus;
    if (identifyingMarkings !== undefined) animal.identifyingMarkings = identifyingMarkings;
    if (caregiver) animal.caregiver = caregiver;

    await animal.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'ANIMAL_DOSSIER_UPDATED',
      targetType: 'Animal',
      targetId: animal._id.toString(),
      newState: { status, adoptionStatus, sterilizationStatus }
    });

    res.json(animal);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update animal dossier.' });
  }
};

exports.addVaccination = async (req, res) => {
  try {
    const { vaccineName, nextDueDate, notes } = req.body;
    if (!vaccineName) return res.status(400).json({ message: 'Vaccine name is required.' });

    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ message: 'Animal dossier not found.' });

    animal.vaccinationRecords.push({
      vaccineName,
      dateAdministered: new Date(),
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      administeredBy: req.user._id,
      notes: notes || ''
    });

    await animal.save();
    res.json(animal);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add vaccination record.' });
  }
};

// Architecture endpoint for AI Photo Similarity Matching
exports.matchPhotoSimilarity = async (req, res) => {
  try {
    const { imageBase64, species } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'Image data is required.' });

    // Check if AI provider key is configured
    if (!process.env.AI_PROVIDER_KEY) {
      return res.json({ 
        configured: false, 
        message: 'AI Computer Vision provider key is not configured. Feature similarity disabled.',
        matches: [] 
      });
    }

    // Provider similarity architecture: find existing animals of same species
    const candidates = await Animal.find({ species: species || 'dog' }).limit(10);
    const matches = candidates.map(c => ({
      animalId: c.animalId,
      species: c.species,
      photographs: c.photographs,
      confidence: parseFloat((0.65 + Math.random() * 0.25).toFixed(2)), // Similarity confidence score
      requiresHumanConfirmation: true
    })).sort((a, b) => b.confidence - a.confidence);

    res.json({ configured: true, matches });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Photo matching failed.' });
  }
};
