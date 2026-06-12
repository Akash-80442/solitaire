import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

interface IconButtonProps {
  name: string;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  solid?: boolean;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  onPress,
  size = 18,
  color = '#FFFFFF',
  style,
  solid = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon name={name} size={size} color={color} solid={solid} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  disabled: {
    opacity: 0.5,
  },
});
