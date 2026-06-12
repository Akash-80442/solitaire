import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  color = '#10B981', // Default emerald
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: disabled ? '#94A3B8' : color, shadowColor: color },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
