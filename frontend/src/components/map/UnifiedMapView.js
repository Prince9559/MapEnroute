import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

const UnifiedMapView = ({ routeData }) => {
  const mapRef = useRef(null);

  // Web ke liye Leaflet HTML/JS iframe ya Leaflet view
  if (Platform.OS === 'web') {
    const start = routeData?.startCoords;
    const end = routeData?.endCoords;
    const path = routeData?.path || [];

    // Map Center calculation
    const centerLat = start ? (start.latitude + end.latitude) / 2 : 25.3176;
    const centerLng = start ? (start.longitude + end.longitude) / 2 : 82.9739;
    const zoom = start ? 11 : 12;

    const polylineCoords = JSON.stringify(path.map((p) => [p.latitude, p.longitude]));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoom});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          const path = ${polylineCoords};
          if (path && path.length > 0) {
            // Route Line
            const polyline = L.polyline(path, { color: '#2563EB', weight: 5, opacity: 0.85 }).addTo(map);
            
            // Start Marker
            L.marker(path[0]).addTo(map).bindPopup("<b>Start:</b> ${routeData?.originName || 'Origin'}").openPopup();
            
            // End Marker
            L.marker(path[path.length - 1]).addTo(map).bindPopup("<b>End:</b> ${routeData?.destinationName || 'Destination'}");
            
            // Auto Fit bounds
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          } else {
            L.marker([25.3176, 82.9739]).addTo(map).bindPopup("Varanasi Center");
          }
        </script>
      </body>
      </html>
    `;

    return (
      <View style={styles.container}>
        <iframe
          ref={mapRef}
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Interactive Map"
        />
      </View>
    );
  }

  // Mobile Native fallback (react-native-maps use hone par)
  return (
    <View style={[styles.container, styles.centered]}>
      <Text style={{ color: '#64748B' }}>Interactive Map View</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UnifiedMapView;