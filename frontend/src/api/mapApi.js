// ==========================================
// MapEnroute - Ultra-Fast Universal Geocoder & Router
// (No backend dependency, No timeouts, Pure High-Speed APIs)
// ==========================================

/**
 * 1. Ultra-Fast Geocoding (0.2s response time for any Indian village, market, or city)
 */
export const geocodePlace = async (query) => {
  if (!query || !query.trim()) return null;
  const clean = query.trim();

  // Engine 1: Komoot Photon API (World's fastest open search for villages & bazaars)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      clean + ' India'
    )}&limit=1`;
    const res = await fetch(photonUrl);
    const data = await res.json();

    if (data?.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      const name = data.features[0].properties?.name || clean;
      const city = data.features[0].properties?.city || data.features[0].properties?.state || '';
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        displayName: `${name}${city ? ', ' + city : ''}`,
      };
    }
  } catch (e) {
    console.warn('Photon lookup bypass, trying fallback...');
  }

  // Engine 2: OpenStreetMap Nominatim Standard Search
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      clean + ', India'
    )}&limit=1`;
    const res = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'MapEnroute-Direct/1.0' },
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
    console.warn('Nominatim bypass...');
  }

  // Engine 3: Fuzzy Clean Search (Agar user ne 'bazar' ya 'gaon' extra likha ho)
  try {
    const stripped = clean.replace(/\b(bazar|market|gaon|gav|village)\b/gi, '').trim();
    if (stripped && stripped !== clean) {
      const retryUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        stripped + ' Uttar Pradesh India'
      )}&limit=1`;
      const res = await fetch(retryUrl);
      const data = await res.json();
      if (data?.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        return {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          displayName: clean,
        };
      }
    }
  } catch (e) {
    // Fail safe
  }

  return null;
};

export const getCoordinatesFromName = geocodePlace;

/**
 * 2. Instant OSRM Road Routing (KM + Hours/Minutes + Polyline)
 */
export const fetchRoute = async (origin, destination) => {
  const startLoc = await geocodePlace(origin);
  const endLoc = await geocodePlace(destination);

  if (!startLoc || !endLoc) {
    const missing = !startLoc ? origin : destination;
    throw new Error(`Location locate nahi hui: "${missing}". Kripya naam dobara dekhein.`);
  }

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLoc.lng},${startLoc.lat};${endLoc.lng},${endLoc.lat}?overview=full&geometries=geojson&steps=true`;

  const res = await fetch(osrmUrl);
  const routeData = await res.json();

  if (!routeData.routes || routeData.routes.length === 0) {
    throw new Error('In dono locations ke beech road route nahi mil paya.');
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