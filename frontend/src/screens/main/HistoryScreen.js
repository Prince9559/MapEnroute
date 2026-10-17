import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { getSearchHistory, removeHistoryItem, clearAllHistory } from '../../utils/historyStorage';
import { useToast } from '../../context/ToastContext';

const HistoryScreen = ({ navigation }) => {
  const { showToast } = useToast();
  const [historyList, setHistoryList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    const data = await getSearchHistory();
    setHistoryList(data);
  };

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDelete = async (id) => {
    const updated = await removeHistoryItem(id);
    setHistoryList(updated);
    showToast('Route removed from history.', 'info');
  };

  const handleClearAll = async () => {
    if (historyList.length === 0) return;
    await clearAllHistory();
    setHistoryList([]);
    showToast('All search history cleared.', 'info');
  };

  const handleReRoute = (item) => {
    navigation.navigate('Route Map', {
      initialOrigin: item.origin,
      initialDestination: item.destination,
    });
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{item.searchedAt}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routeIconCol}>
          <View style={styles.dotGreen} />
          <View style={styles.lineConnect} />
          <View style={styles.dotRed} />
        </View>
        <View style={styles.locationNamesCol}>
          <Text style={styles.originText} numberOfLines={1}>{item.origin}</Text>
          <Text style={styles.destText} numberOfLines={1}>{item.destination}</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.statsBadge}>
          <Text style={styles.statsText}>{item.distance} • {item.duration}</Text>
        </View>

        <TouchableOpacity
          style={styles.reRouteBtn}
          onPress={() => handleReRoute(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.reRouteBtnText}>View Route ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recent Trips</Text>
          <Text style={styles.subtitle}>Your searched routes and history</Text>
        </View>
        {historyList.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {historyList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>No search history yet</Text>
          <Text style={styles.emptySubtitle}>
            Routes you search on the map will automatically appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={historyList}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1D4ED8']} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  routeIconCol: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
  },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  lineConnect: {
    width: 2,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  locationNamesCol: {
    flex: 1,
    justifyContent: 'space-between',
    height: 38,
  },
  originText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  destText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statsBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  reRouteBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reRouteBtnText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
});

export default HistoryScreen;