import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const UnifiedMapView = ({
  routePoints = [],
  startPoint,
  endPoint,
  stops = [],
  onSelectStop,
}) => {
  if (Platform.OS === 'web') {
    const hasRoute = routePoints.length > 0;
    const startLat = startPoint?.lat || 25.3265;
    const startLng = startPoint?.lng || 82.9864;

    const leafletHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          
          /* Start & End Dropper Pins */
          .google-pin {
            position: relative;
            width: 30px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .pin-shape {
            width: 22px;
            height: 22px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            position: absolute;
            top: 2px;
            left: 4px;
            box-shadow: -2px 3px 6px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .pin-shape::after {
            content: '';
            width: 8px;
            height: 8px;
            background: #FFFFFF;
            border-radius: 50%;
            transform: rotate(45deg);
          }
          .pin-green { background: #10B981; }
          .pin-red { background: #EF4444; }

          /* Modern En-Route Pill Badge (Emoji + Name) */
          .stop-pill {
            display: inline-flex;
            align-items: center;
            background-color: #FFFFFF;
            padding: 4px 8px;
            border-radius: 20px;
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.22);
            border: 1.5px solid #2563EB;
            cursor: pointer;
            white-space: nowrap;
            transition: transform 0.15s ease, background-color 0.15s ease;
          }
          .stop-pill:hover {
            transform: scale(1.06);
            background-color: #EFF6FF;
          }
          .stop-pill-emoji {
            font-size: 13px;
            margin-right: 5px;
          }
          .stop-pill-name {
            font-size: 11.5px;
            font-weight: 700;
            color: #1E293B;
            max-width: 110px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: true }).setView([${startLat}, ${startLng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          ${
            hasRoute
              ? `
            const coords = ${JSON.stringify(
              routePoints.map((p) => [p.latitude, p.longitude])
            )};

            // Route Polyline
            const polyline = L.polyline(coords, {
              color: '#1D4ED8',
              weight: 5,
              opacity: 0.9,
              lineJoin: 'round',
              lineCap: 'round'
            }).addTo(map);

            // Start Pin
            const greenPinIcon = L.divIcon({
              html: '<div class="google-pin"><div class="pin-shape pin-green"></div></div>',
              iconSize: [30, 38],
              iconAnchor: [15, 36],
              className: ''
            });
            L.marker(coords[0], { icon: greenPinIcon }).addTo(map);

            // Destination Pin
            const redPinIcon = L.divIcon({
              html: '<div class="google-pin"><div class="pin-shape pin-red"></div></div>',
              iconSize: [30, 38],
              iconAnchor: [15, 36],
              className: ''
            });
            L.marker(coords[coords.length - 1], { icon: redPinIcon }).addTo(map);

            // Stops with Emoji + Real Name Badge
            const rawStops = ${JSON.stringify(stops)};
            rawStops.forEach((s) => {
              const iconEmoji = s.category === 'fuel' ? '⛽' : (s.category === 'food' ? '🍔' : '⚡');
              const displayName = s.name || (s.category === 'fuel' ? 'Fuel Station' : 'Cafe / Diner');

              const stopBadgeHTML = \`
                <div class="stop-pill" title="\${displayName}">
                  <span class="stop-pill-emoji">\${iconEmoji}</span>
                  <span class="stop-pill-name">\${displayName}</span>
                </div>
              \`;

              const stopIcon = L.divIcon({
                html: stopBadgeHTML,
                className: '',
                iconAnchor: [45, 14] // Center aligned above location
              });

              const stopMarker = L.marker([s.lat, s.lng], { icon: stopIcon }).addTo(map);
              stopMarker.on('click', () => {
                window.parent.postMessage({ type: 'STOP_CLICKED', stop: s }, '*');
              });
            });

            map.fitBounds(polyline.getBounds(), { padding: [60, 60] });
          `
              : `
            L.marker([${startLat},${startLng}]).addTo(map);
          `
          }
        </script>
      </body>
      </html>
    `;

    return (
      <View style={styles.webContainer}>
        <iframe
          key={`${routePoints.length}-${stops.length}`}
          title="Interactive Route Map"
          srcDoc={leafletHTML}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  webContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E2E8F0',
  },
});

export default UnifiedMapView;