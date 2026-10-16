// Duration string "1230s" ko seconds number me convert karta hai
const durationToSeconds = (duration) => {
  if (!duration) return 0;
  return Number(duration.replace('s', ''));
};

// Haversine formula: Do lat-lng points ke beech meters me distance
const getDistance = (point1, point2) => {
  const [lat1, lng1] = point1;
  const [lat2, lng2] = point2;

  const R = 6371000; // Earth radius in meters
  const toRadians = (deg) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Pura route distance ka aadha (50%) distance cover karne wala exact waypoint
const getHalfwayPoint = (points, totalRouteDistance) => {
  const halfwayDistance = totalRouteDistance / 2;
  let travelDistance = 0;

  for (let i = 1; i < points.length; i++) {
    travelDistance += getDistance(points[i - 1], points[i]);
    if (travelDistance >= halfwayDistance) {
      return points[i];
    }
  }
  return points[points.length - 1];
};

module.exports = {
  durationToSeconds,
  getDistance,
  getHalfwayPoint
};