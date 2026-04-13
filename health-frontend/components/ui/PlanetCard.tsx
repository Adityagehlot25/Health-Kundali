import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Expo's built-in icon library

// Define the exact props the card will expect
interface PlanetCardProps {
  title: string;
  value: string | number;
  unit?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  status?: 'normal' | 'optimal' | 'warning' | 'critical'; 
}

const { width } = Dimensions.get('window');
// Calculate card width: 3 cards per row, minus padding and gaps
const CARD_WIDTH = (width - 40 - 24) / 3; 

export default function PlanetCard({ title, value, unit, iconName, status = 'normal' }: PlanetCardProps) {
  
  // Dynamic color logic based on the AI's alert level
  const getStatusColor = () => {
    switch (status) {
      case 'optimal': return '#22C55E'; // Green
      case 'warning': return '#F59E0B'; // Yellow
      case 'critical': return '#EF4444'; // Red
      default: return '#3B82F6'; // Blue (Normal)
    }
  };

  const statusColor = getStatusColor();

  return (
    <View style={[styles.card, { borderTopColor: statusColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${statusColor}20` }]}>
        <Ionicons name={iconName} size={24} color={statusColor} />
      </View>
      
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value} numberOfLines={1}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1E293B', // Dark sleek background
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderTopWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  title: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  unit: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 2,
    fontWeight: '500',
  }
});