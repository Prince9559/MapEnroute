// Calculate map bounding box to auto-fit route
export const getRegionForCoordinates = (points) => {
  let minX, maxX, minY, maxY;

  (points || []).forEach((point) => {
    minX = Math.min(minX !== undefined ? minX : point.latitude, point.latitude);
    maxX = Math.max(maxX !== undefined ? maxX : point.latitude, point.latitude);
    minY = Math.min(minY !== undefined ? minY : point.longitude, point.longitude);
    maxY = Math.max(maxY !== undefined ? maxY : point.longitude, point.longitude);
  });

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const deltaX = (maxX - minX) * 1.3;
  const deltaY = (maxY - minY) * 1.3;

  return {
    latitude: midX || 25.3176, // Default Varanasi coords
    longitude: midY || 82.9739,
    latitudeDelta: Math.max(deltaX, 0.05),
    longitudeDelta: Math.max(deltaY, 0.05),
  };
};