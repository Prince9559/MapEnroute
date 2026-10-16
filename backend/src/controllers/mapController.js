const { decode } = require('@googlemaps/polyline-codec');
const { computeRoute, searchAlongRoutePlaces } = require('../services/googleMapsService');
const { durationToSeconds, getHalfwayPoint } = require('../utils/geoUtils');

// @desc    Calculate route between origin and destination
// @route   POST /api/maps/routes
// @access  Public
const getRoute = async (req, res) => {
  try {
    const { originLat, originLng, destinationLat, destinationLng } = req.body;

    if (!originLat || !originLng || !destinationLat || !destinationLng) {
      return res.status(400).json({
        success: false,
        message: 'Origin and Destination coordinates are required'
      });
    }

    const route = await computeRoute(
      { latitude: originLat, longitude: originLng },
      { latitude: destinationLat, longitude: destinationLng }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'No route found between these locations'
      });
    }

    return res.status(200).json({
      success: true,
      route: {
        distanceMeters: route.distanceMeters,
        durationSeconds: durationToSeconds(route.duration),
        encodedPolyline: route.polyline?.encodedPolyline
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Smart en-route discovery (Stops, Halfway Point, Detour Time)
// @route   POST /api/maps/enroute-search
// @access  Public
const searchEnrouteStops = async (req, res) => {
  try {
    const {
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      query = 'restaurant',
      maxDetourMinutes = 20
    } = req.body;

    if (!originLat || !originLng || !destinationLat || !destinationLng) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination coordinates are required'
      });
    }

    // Step 1: Compute main route
    const route = await computeRoute(
      { latitude: originLat, longitude: originLng },
      { latitude: destinationLat, longitude: destinationLng }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'No route found'
      });
    }

    const distanceMeters = route.distanceMeters;
    const originalRouteDuration = durationToSeconds(route.duration);
    const encodedPolyline = route.polyline.encodedPolyline;

    // Step 2: Calculate Halfway point using decoded polyline
    const decodedPoints = decode(encodedPolyline);
    const halfwayPoint = getHalfwayPoint(decodedPoints, distanceMeters);
    const halfwayLatitude = halfwayPoint[0];
    const halfwayLongitude = halfwayPoint[1];

    // Step 3: Fetch places along route
    const placesData = await searchAlongRoutePlaces(
      query,
      encodedPolyline,
      originLat,
      originLng,
      halfwayLatitude,
      halfwayLongitude
    );

    // Step 4: Calculate detour time and scoring for each place
    const placesWithDetour = (placesData.places || [])
      .map((place, index) => {
        const routingSummary = placesData.routingSummaries?.[index];
        const firstLeg = routingSummary?.legs?.[0];
        const secondLeg = routingSummary?.legs?.[1];

        if (!firstLeg || !secondLeg) return null;

        const firstLegSeconds = durationToSeconds(firstLeg.duration);
        const secondLegSeconds = durationToSeconds(secondLeg.duration);
        const totalWithStop = firstLegSeconds + secondLegSeconds;
        const detourSeconds = totalWithStop - originalRouteDuration;

        const rating = place.rating || 0;
        const reviewCount = place.userRatingCount || 0;
        const detourMinutes = Math.round(detourSeconds / 60);

        // Smart ranking score
        const score = rating * 20 + Math.min(reviewCount / 100, 20) - detourMinutes;

        return {
          id: place.id,
          name: place.displayName?.text,
          address: place.formattedAddress,
          location: place.location,
          primaryType: place.primaryType,
          rating,
          userRatingCount: reviewCount,
          detourMinutes: detourMinutes < 0 ? 0 : detourMinutes,
          score: Math.round(score)
        };
      })
      .filter(Boolean);

    // Step 5: Filter by max detour minutes and sort highest score first
    const filteredPlaces = placesWithDetour
      .filter((place) => place.detourMinutes <= maxDetourMinutes)
      .sort((a, b) => b.score - a.score);

    return res.status(200).json({
      success: true,
      route: {
        distanceMeters,
        durationSeconds: originalRouteDuration,
        encodedPolyline
      },
      halfwayPoint: {
        latitude: halfwayLatitude,
        longitude: halfwayLongitude
      },
      totalStopsFound: filteredPlaces.length,
      places: filteredPlaces
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getRoute,
  searchEnrouteStops
};