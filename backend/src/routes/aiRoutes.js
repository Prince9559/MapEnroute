const express = require('express');
const router = express.Router();
const { analyzePlace } = require('../controllers/aiController');

router.get('/places/:placeId/analyze', analyzePlace);

module.exports = router;