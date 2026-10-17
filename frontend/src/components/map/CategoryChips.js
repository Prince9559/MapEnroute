import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CATEGORIES = [
  { id: 'fuel', label: '⛽ Fuel', query: 'petrol pump' },
  { id: 'food', label: '🍔 Food & Cafes', query: 'restaurant cafe' },
  { id: 'ev', label: '⚡ EV Charging', query: 'ev charging' },
  { id: 'hotel', label: '🏨 Stays', query: 'hotel' },
  { id: 'atm', label: '🏧 ATMs', query: 'atm bank' },
];

const CategoryChips = ({ activeCategory, onSelectCategory }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = activeCategory === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, isSelected && styles.chipActive]}
            onPress={() => onSelectCategory(isSelected ? null : cat.id, cat.query)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
  },
  chipActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  chipText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});

export default CategoryChips;