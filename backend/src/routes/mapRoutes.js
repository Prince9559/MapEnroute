const express = require('express');
const router = express.Router();
const { getRoute, searchEnrouteStops } = require('../controllers/mapController');

router.post('/routes', getRoute);
router.post('/enroute-search', searchEnrouteStops);

module.exports = router;