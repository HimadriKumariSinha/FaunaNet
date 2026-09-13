const LostFoundReport = require('../models/LostFoundReport');
const AuditLog = require('../models/AuditLog');

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || typeof lat2 !== 'number' || typeof lon2 !== 'number') {
    return 999;
  }
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

exports.createReport = async (req, res) => {
  try {
    const { type, species, petName, photos, lastSeenLocation, contactName, contactPhone, identifyingMarks } = req.body;
    if (!type || !species || !lastSeenLocation || !contactName || !contactPhone) {
      return res.status(400).json({ message: 'Type (LOST/FOUND), species, last seen location, and contact information are required.' });
    }

    const report = await LostFoundReport.create({
      type,
      species,
      petName: petName || '',
      photos: photos || [],
      lastSeenLocation,
      contactName,
      contactPhone,
      identifyingMarks: identifyingMarks || '',
      createdBy: req.user._id
    });

    await AuditLog.create({
      actor: req.user._id,
      action: `LOST_FOUND_${type}_CREATED`,
      targetType: 'LostFoundReport',
      targetId: report._id.toString(),
      metadata: { species, city: lastSeenLocation.city }
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create Lost/Found listing.' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { type, species, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (species) filter.species = species;
    if (status) filter.status = status;

    const reports = await LostFoundReport.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch Lost/Found listings.' });
  }
};

exports.findMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await LostFoundReport.findById(id);
    if (!target) return res.status(404).json({ message: 'Listing not found.' });

    // Find opposite type (LOST matches with FOUND)
    const oppositeType = target.type === 'LOST' ? 'FOUND' : 'LOST';
    const candidates = await LostFoundReport.find({
      type: oppositeType,
      species: target.species,
      status: 'ACTIVE'
    });

    const matches = candidates.map(c => {
      const distKm = calculateDistanceKm(
        target.lastSeenLocation.lat,
        target.lastSeenLocation.lng,
        c.lastSeenLocation.lat,
        c.lastSeenLocation.lng
      );
      
      let confidence = 0.5;
      if (distKm <= 2) confidence += 0.3;
      if (target.identifyingMarks && c.identifyingMarks && target.identifyingMarks.toLowerCase() === c.identifyingMarks.toLowerCase()) {
        confidence += 0.2;
      }

      return {
        ...c.toObject(),
        distanceKm: distKm,
        confidence: Math.min(confidence, 0.98)
      };
    }).filter(m => m.distanceKm <= 10).sort((a, b) => b.confidence - a.confidence);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Match calculation failed.' });
  }
};
