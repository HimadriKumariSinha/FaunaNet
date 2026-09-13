const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoptionController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, adoptionController.getApplications);
router.post('/', auth, adoptionController.submitApplication);
router.put('/:id/review', auth, adoptionController.reviewApplication);

module.exports = router;
