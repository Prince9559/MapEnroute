import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import RouteSearchBar from '../../components/map/RouteSearchBar';
import CategoryChips from '../../components/map/CategoryChips';
import UnifiedMapView from '../../components/map/UnifiedMapView';
import { fetchRoute, fetchEnroutePlaces } from '../../api/mapApi';
import { useToast } from '../../context/ToastContext';
import { saveRouteToHistory } from '../../utils/historyStorage';

const MapHomeScreen = () => {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [loading, setLoading] = useState(false);

  // Web iframe message listener for stop clicks
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'STOP_CLICKED') {
        setSelectedStop(event.data.stop);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRouteSearch = async (origin, destination) => {
    if (!origin.trim() || !destination.trim()) {
      showToast('Please enter both origin and destination.', 'error');
      return;
    }

    
    setLoading(true);
    setStops([]);
    setSelectedStop(null);
    try {
      const response = await fetchRoute(origin, destination);
      if (response && response.success) {
        setRouteInfo(response.data);
        showToast(
          `Route found: ${response.data.distance} (~${response.data.duration})`,
          'success'
        );
        // Save to History
        saveRouteToHistory(response.data);
      }
    } catch (error) {
      showToast(error.message || 'Route calculation failed. Check locations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId, query) => {
    setActiveCategory(categoryId);
    setSelectedStop(null);

    if (!categoryId) {
      setStops([]);
      return;
    }

    if (!routeInfo) {
      showToast('Please search a route first to find enroute spots.', 'info');
      return;
    }

    setLoading(true);
    try {
      showToast(`Searching ${query} along this route...`, 'info');
      const res = await fetchEnroutePlaces(routeInfo.points, categoryId);
      if (res && res.success) {
        setStops(res.data);
        showToast(`Found ${res.data.length} ${query} stations on your path!`, 'success');
      }
    } catch (err) {
      showToast(`Unable to load ${query} at the moment.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Map Canvas with Route & Stops */}
      <UnifiedMapView
        routePoints={routeInfo?.points || []}
        startPoint={routeInfo?.startCoords}
        endPoint={routeInfo?.endCoords}
        stops={stops}
      />

      {/* 2. Top Controls */}
      <View style={styles.overlayControls}>
        <RouteSearchBar onSearchRoute={handleRouteSearch} />
        <CategoryChips
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />
      </View>

      {/* 3. Loader */}
      {loading && (
        <View style={styles.loaderBadge}>
          <ActivityIndicator size="small" color="#1D4ED8" />
          <Text style={styles.loaderText}>Searching enroute places...</Text>
        </View>
      )}

      {/* 4. Stop Details Card (Jab kisi stop pin par click ho) */}
      {selectedStop ? (
        <View style={styles.stopDetailCard}>
          <View style={styles.stopHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stopName}>{selectedStop.name}</Text>
              <Text style={styles.stopBrand}>{selectedStop.brand} • {selectedStop.distanceOffset}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedStop(null)} style={styles.closeCardBtn}>
              <Text style={styles.closeCardText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stopMetaRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {selectedStop.rating}</Text>
            </View>
            <TouchableOpacity
              style={styles.addStopBtn}
              onPress={() => {
                showToast(`Added ${selectedStop.name} as a stopover!`, 'success');
                setSelectedStop(null);
              }}
            >
              <Text style={styles.addStopBtnText}>Add Stop to Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Default Route Summary Card */
        routeInfo && (
          <View style={styles.routeSummaryCard}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.routeDuration}>{routeInfo.duration}</Text>
                <Text style={styles.routeDistance}>{routeInfo.distance} driving distance</Text>
              </View>
              <View style={styles.stopsBadge}>
                <Text style={styles.stopsBadgeText}>
                  {stops.length > 0 ? `${stops.length} Filtered` : `${routeInfo.stopsFound} Spots Nearby`}
                </Text>
              </View>
            </View>
            <Text style={styles.routePath}>
              {routeInfo.origin} ➔ {routeInfo.destination}
            </Text>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  overlayControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  loaderBadge: {
    position: 'absolute',
    top: 180,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  loaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  routeSummaryCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeDuration: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10B981',
  },
  routeDistance: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  stopsBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stopsBadgeText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 12,
  },
  routePath: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginTop: 10,
  },
  stopDetailCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    elevation: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 20,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  stopBrand: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  closeCardBtn: {
    padding: 4,
  },
  closeCardText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  stopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 13,
  },
  addStopBtn: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addStopBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default MapHomeScreen;