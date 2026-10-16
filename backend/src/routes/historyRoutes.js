const express = require('express');
const router = express.Router();
const {
  saveSearchHistory,
  getUserHistory,
  deleteHistoryItem,
  clearUserHistory
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

// Sabhi history routes ko JWT protection chahiye
router.use(protect);

router.post('/', saveSearchHistory);
router.get('/', getUserHistory);
router.delete('/', clearUserHistory);
router.delete('/:id', deleteHistoryItem);

module.exports = router;