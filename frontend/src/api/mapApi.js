import client from './client';

// 1. Universal Smart Geocoder
export const geocodePlace = async (query) => {
  if (!query || !query.trim()) return null;
  const cleanQuery = query.trim();

  // Try 1: OpenStreetMap Nominatim Standard Search
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery + ', India'
    )}&limit=1`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MapEnroute-Universal-App/1.0',
        'Accept-Language': 'en,hi',
      },
    });

    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
  } catch (e) {
    // Proceed to AI fallback
  }

  // Try 2: Universal AI Geocoding (Har gaon, chhota kasba, bazaar identify karega)
  try {
    const aiRes = await client.post(
      '/map/geocode-ai',
      { placeName: cleanQuery },
      { timeout: 45000 } // Extended timeout for AI geocoding
    );

    if (aiRes.data?.success && aiRes.data?.data) {
      const { lat, lng, displayName } = aiRes.data.data;
      return {
        lat,
        lng,
        latitude: lat,
        longitude: lng,
        displayName,
      };
    }
  } catch (err) {
    console.warn('AI Geocode Error:', err?.response?.data || err.message);
  }

  return null;
};

export const getCoordinatesFromName = geocodePlace;

// 2. Real Driving Path, Exact KM & Travel Time
export const fetchRoute = async (origin, destination) => {
  const startLoc = await geocodePlace(origin);
  const endLoc = await geocodePlace(destination);

  if (!startLoc || !endLoc) {
    const missing = !startLoc ? origin : destination;
    throw new Error(`Location locate nahi hui: "${missing}". Kripya spelling check karein.`);
  }

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLoc.lng},${startLoc.lat};${endLoc.lng},${endLoc.lat}?overview=full&geometries=geojson&steps=true`;

  const res = await fetch(osrmUrl);
  const routeData = await res.json();

  if (!routeData.routes || routeData.routes.length === 0) {
    throw new Error('In dono locations ke beech driving road path nahi mila.');
  }

  const route = routeData.routes[0];
  const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
  const durationMin = Math.round(route.duration / 60);

  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  const formattedTime = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

  const coordinates = (route.geometry?.coordinates || []).map((coord) => ({
    latitude: coord[1],
    longitude: coord[0],
  }));

  const steps = (route.legs?.[0]?.steps || []).map((s) => ({
    instruction: s.maneuver?.type || 'Proceed',
    name: s.name || 'Road',
    distance: (s.distance / 1000).toFixed(1) + ' km',
  }));

  return {
    success: true,
    data: {
      origin,
      destination,
      distance: `${distanceKm} km`,
      duration: formattedTime,
      distanceRaw: distanceKm,
      durationRaw: durationMin,
      points: coordinates,
      path: coordinates,
      steps,
      startCoords: startLoc,
      endCoords: endLoc,
    },
  };
};

export const fetchRouteBetweenCoords = async (startCoords, endCoords) => {
  try {
    const startLat = startCoords.latitude || startCoords.lat;
    const startLng = startCoords.longitude || startCoords.lng;
    const endLat = endCoords.latitude || endCoords.lat;
    const endLng = endCoords.longitude || endCoords.lng;

    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
      const durationMin = Math.round(route.duration / 60);

      const hours = Math.floor(durationMin / 60);
      const minutes = durationMin % 60;
      const formattedTime = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

      const pathCoordinates = route.geometry.coordinates.map((coord) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));

      return {
        path: pathCoordinates,
        points: pathCoordinates,
        distance: `${distanceKm} km`,
        duration: formattedTime,
        rawDistance: distanceKm,
        rawDuration: durationMin,
      };
    }
    return null;
  } catch (err) {
    console.error('OSRM Coords Route error:', err);
    return null;
  }
  
};