const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const auth = require('../middleware/authMiddleware');

router.get('/', lostFoundController.getReports);
router.post('/', auth, lostFoundController.createReport);
router.get('/match/:id', auth, lostFoundController.findMatches);

module.exports = router;
