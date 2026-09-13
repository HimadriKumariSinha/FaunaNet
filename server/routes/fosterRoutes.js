const express = require('express');
const router = express.Router();
const fosterController = require('../controllers/fosterController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, fosterController.getApplications);
router.post('/', auth, fosterController.submitApplication);
router.put('/:id/review', auth, fosterController.reviewApplication);

module.exports = router;
