const Trip = require('../models/Trip');
const { decode } = require('@googlemaps/polyline-codec');

// @desc    Calculate route & sample waypoints along the route
// @route   POST /api/trips/plan
// @access  Private
const planRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and Destination are required'
      });
    }

    // Google Directions API call (agar GOOGLE_MAPS_API_KEY ho) ya Mock/Fallback data
    // Yahan hum standard polyline sampling algorithm implement kar rahe hain
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

    let routeData;

    if (googleApiKey) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(destination)}&key=${googleApiKey}`
      );
      const data = await response.json();

      if (data.status !== 'OK') {
        return res.status(400).json({
          success: false,
          message: data.error_message || 'Could not find a valid route'
        });
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      // Decode polyline to sample points every few kilometers
      const decodedPoints = decode(route.overview_polyline.points); // [[lat, lng], ...]

      // Har 10th-15th point ko check karke sampled waypoint banayenge
      const sampledWaypoints = decodedPoints.filter((_, idx) => idx % 15 === 0).map(p => ({
        lat: p[0],
        lng: p[1]
      }));

      routeData = {
        origin: {
          name: leg.start_address,
          lat: leg.start_location.lat,
          lng: leg.start_location.lng
        },
        destination: {
          name: leg.end_address,
          lat: leg.end_location.lat,
          lng: leg.end_location.lng
        },
        distanceText: leg.distance.text,
        durationText: leg.duration.text,
        polyline: route.overview_polyline.points,
        sampledWaypoints
      };
    } else {
      // Mock route for development if Google API Key isn't added yet
      routeData = {
        origin: { name: origin, lat: 28.6139, lng: 77.2090 },
        destination: { name: destination, lat: 26.8467, lng: 80.9462 },
        distanceText: '530 km',
        durationText: '8 hours',
        polyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
        sampledWaypoints: [
          { lat: 28.6139, lng: 77.2090 },
          { lat: 27.5, lng: 79.0 },
          { lat: 26.8467, lng: 80.9462 }
        ]
      };
    }

    return res.status(200).json({
      success: true,
      data: routeData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save a planned trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const { title, origin, destination, distanceText, durationText, polyline, stops } = req.body;

    const trip = await Trip.create({
      user: req.user._id,
      title: title || `${origin.name} to ${destination.name}`,
      origin,
      destination,
      distanceText,
      durationText,
      polyline,
      stops: stops || []
    });

    return res.status(201).json({
      success: true,
      message: 'Trip saved successfully',
      data: trip
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's saved trips
// @route   GET /api/trips
// @access  Private
const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a saved trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this trip' });
    }

    await trip.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  planRoute,
  createTrip,
  getMyTrips,
  deleteTrip
};