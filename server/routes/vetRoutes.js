const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, vetController.getAllMedicalRecords);
router.get('/animal/:animalId', auth, vetController.getMedicalRecordsByAnimal);
router.post('/', auth, vetController.createMedicalRecord);

module.exports = router;
