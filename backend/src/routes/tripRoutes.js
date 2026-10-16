const express = require('express');
const router = express.Router();
const {
  planRoute,
  createTrip,
  getMyTrips,
  deleteTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Saare trip endpoints authenticated user ke liye protected hain

router.post('/plan', planRoute);
router.route('/')
  .get(getMyTrips)
  .post(createTrip);

router.delete('/:id', deleteTrip);

module.exports = router;