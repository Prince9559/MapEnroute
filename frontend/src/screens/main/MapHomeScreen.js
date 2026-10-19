import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import UnifiedMapView from '../../components/map/UnifiedMapView';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme/colors';
import { getCoordinatesFromName, fetchRouteBetweenCoords } from '../../api/mapApi';

const MapHomeScreen = ({ route }) => {
  const { showToast } = useToast();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration, path, start, end }
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Jab Explore tab se "📍 Plot Route" dabayein toh auto-run ho
  useEffect(() => {
    if (route.params?.initialOrigin && route.params?.initialDestination) {
      const { initialOrigin, initialDestination } = route.params;
      setOrigin(initialOrigin);
      setDestination(initialDestination);
      handleCalculate(initialOrigin, initialDestination);
    }
  }, [route.params?.initialOrigin, route.params?.initialDestination]);

  const handleCalculate = async (startPlace = origin, endPlace = destination) => {
    const from = startPlace.trim();
    const to = endPlace.trim();

    if (!from || !to) {
      showToast('Please enter both Origin and Destination', 'error');
      return;
    }

    setLoadingRoute(true);
    setRouteInfo(null);

    try {
      // 1. Geocode Origin
      const startCoords = await getCoordinatesFromName(from);
      if (!startCoords) {
        showToast(`Could not find location: "${from}"`, 'error');
        setLoadingRoute(false);
        return;
      }

      // 2. Geocode Destination
      const endCoords = await getCoordinatesFromName(to);
      if (!endCoords) {
        showToast(`Could not find location: "${to}"`, 'error');
        setLoadingRoute(false);
        return;
      }

      // 3. OSRM Road Path, KM aur Time nikaalein
      const result = await fetchRouteBetweenCoords(startCoords, endCoords);

      if (result && result.path.length > 0) {
        setRouteInfo({
          startCoords,
          endCoords,
          path: result.path,
          distance: result.distance,
          duration: result.duration,
          originName: from,
          destinationName: to,
        });
        showToast(`Route loaded: ${result.distance} • ${result.duration}`, 'success');
      } else {
        showToast('No road driving route found between these places.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to calculate route', 'error');
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    if (temp && destination) {
      handleCalculate(destination, temp);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Search Card */}
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputDot}>🟢</Text>
          <TextInput
            style={styles.input}
            placeholder="Starting location (e.g. Bhadohi)"
            placeholderTextColor="#94A3B8"
            value={origin}
            onChangeText={setOrigin}
          />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dashedLine} />
          <TouchableOpacity onPress={handleSwap} style={styles.swapBtn}>
            <Text style={styles.swapText}>⇅</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputDot}>🔴</Text>
          <TextInput
            style={styles.input}
            placeholder="Destination (e.g. Varanasi Junction)"
            placeholderTextColor="#94A3B8"
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleCalculate()}
          disabled={loadingRoute}
          activeOpacity={0.8}
        >
          {loadingRoute ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.searchButtonText}>Calculate Route</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Floating Info Pill: KM & Time Details */}
      {routeInfo && (
        <View style={styles.routeBadge}>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeLabel}>DISTANCE</Text>
            <Text style={styles.badgeValue}>🚗 {routeInfo.distance}</Text>
          </View>
          <View style={styles.badgeDivider} />
          <View style={styles.badgeItem}>
            <Text style={styles.badgeLabel}>ESTIMATED TIME</Text>
            <Text style={styles.badgeValue}>⏱️ {routeInfo.duration}</Text>
          </View>
        </View>
      )}

      {/* Map View */}
      <View style={styles.mapContainer}>
        <UnifiedMapView routeData={routeInfo} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputDot: {
    fontSize: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 13.5,
    color: '#0F172A',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 4,
    paddingRight: 8,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  swapBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: colors?.primary || '#1D4ED8',
    marginTop: 10,
    borderRadius: 10,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  routeBadge: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeItem: {
    alignItems: 'center',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
  },
  mapContainer: {
    flex: 1,
  },
});

export default MapHomeScreen;