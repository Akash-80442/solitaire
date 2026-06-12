import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

export interface Segment {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  selectedValue,
  onValueChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {segments.map((segment) => {
        const isActive = selectedValue === segment.value;
        return (
          <TouchableOpacity
            key={segment.value}
            style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
            onPress={() => onValueChange(segment.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
              {segment.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    width: '100%',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: COLORS.textDark,
    fontWeight: '800',
  },
});
