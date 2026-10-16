const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['food', 'fuel', 'scenic', 'stay', 'other'], default: 'other' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  rating: { type: Number, default: 0 },
  address: { type: String }
});

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true
    },
    origin: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    destination: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    distanceText: { type: String }, // e.g., "320 km"
    durationText: { type: String }, // e.g., "5 hours 30 mins"
    polyline: { type: String, required: true }, // Encoded polyline for map drawing
    stops: [stopSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Trip', tripSchema);