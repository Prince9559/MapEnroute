const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    origin: {
      name: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    destination: {
      name: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    distanceMeters: {
      type: Number
    },
    durationSeconds: {
      type: Number
    },
    selectedCategory: {
      type: String,
      default: 'all' // e.g., restaurant, gas_station, it_company
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SearchHistory', searchHistorySchema);