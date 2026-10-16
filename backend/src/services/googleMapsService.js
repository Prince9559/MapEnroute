const computeRoute = async (origin, destination) => {
  const response = await fetch(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline'
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude
            }
          }
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude
            }
          }
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE'
      })
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Routes API call failed');
  }

  return data.routes?.[0];
};

const searchAlongRoutePlaces = async (query, encodedPolyline, originLat, originLng, halfwayLat, halfwayLng) => {
  const response = await fetch(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType,routingSummaries'
      },
      body: JSON.stringify({
        textQuery: query,
        pageSize: 15,
        searchAlongRouteParameters: {
          polyline: {
            encodedPolyline
          }
        },
        locationRestriction: {
          rectangle: {
            low: {
              latitude: halfwayLat - 0.25,
              longitude: halfwayLng - 0.25
            },
            high: {
              latitude: halfwayLat + 0.25,
              longitude: halfwayLng + 0.25
            }
          }
        },
        routingParameters: {
          origin: {
            latitude: originLat,
            longitude: originLng
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE'
        }
      })
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Places along route failed');
  }

  return data;
};

module.exports = {
  computeRoute,
  searchAlongRoutePlaces
};