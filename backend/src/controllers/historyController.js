const SearchHistory = require('../models/SearchHistory');

// @desc    Save a route search to history
// @route   POST /api/history
// @access  Private
const saveSearchHistory = async (req, res) => {
  try {
    const { origin, destination, distanceMeters, durationSeconds, selectedCategory } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required'
      });
    }

    const historyItem = await SearchHistory.create({
      userId: req.user._id,
      origin,
      destination,
      distanceMeters,
      durationSeconds,
      selectedCategory
    });

    return res.status(201).json({
      success: true,
      message: 'Search history saved',
      data: historyItem
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all search history of logged-in user
// @route   GET /api/history
// @access  Private
const getUserHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a specific history item
// @route   DELETE /api/history/:id
// @access  Private
const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const historyItem = await SearchHistory.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: 'History item not found or unauthorized'
      });
    }

    await SearchHistory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'History item deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear all search history for logged-in user
// @route   DELETE /api/history
// @access  Private
const clearUserHistory = async (req, res) => {
  try {
    await SearchHistory.deleteMany({ userId: req.user._id });

    return res.status(200).json({
      success: true,
      message: 'All search history cleared'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  saveSearchHistory,
  getUserHistory,
  deleteHistoryItem,
  clearUserHistory
};