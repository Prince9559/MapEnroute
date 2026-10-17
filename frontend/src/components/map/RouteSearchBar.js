import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';

const RouteSearchBar = ({ onSearchRoute }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSearch = () => {
    if (origin.trim() && destination.trim()) {
      onSearchRoute(origin.trim(), destination.trim());
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.inputGroup}>
        <View style={styles.indicatorCol}>
          <View style={styles.originDot} />
          <View style={styles.dashedLine} />
          <View style={styles.destSquare} />
        </View>

        <View style={styles.fieldsCol}>
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outline: 'none' }]}
            placeholder="Starting point (e.g. Cantt Station)"
            placeholderTextColor="#94A3B8"
            value={origin}
            onChangeText={setOrigin}
          />
          <View style={styles.divider} />
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outline: 'none' }]}
            placeholder="Destination (e.g. BHU Gate)"
            placeholderTextColor="#94A3B8"
            value={destination}
            onChangeText={setDestination}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleSearch}
        activeOpacity={0.8}
      >
        <Text style={styles.searchButtonText}>Find Route</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 8,
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  dashedLine: {
    width: 2,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  destSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  fieldsCol: {
    flex: 1,
  },
  input: {
    height: 38,
    fontSize: 14,
    color: '#0F172A',
    paddingHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  searchButton: {
    backgroundColor: '#1D4ED8',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default RouteSearchBar;