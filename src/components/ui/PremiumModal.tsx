import React from 'react';
import { Modal, View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { COMMON_STYLES, COLORS } from '../../constants/theme';

interface PremiumModalProps {
  visible: boolean;
  title?: string;
  icon?: string;
  onClose?: () => void;
  children: React.ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
  contentStyle?: StyleProp<ViewStyle>;
  noPadding?: boolean;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  title,
  icon,
  onClose,
  children,
  animationType = 'fade',
  contentStyle,
  noPadding = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType={animationType} onRequestClose={onClose}>
      <View style={COMMON_STYLES.modalOverlay}>
        <View style={[
          COMMON_STYLES.paperPanel,
          styles.modalContent,
          noPadding && { padding: 0 },
          contentStyle,
        ]}>
          {(title || icon) && (
            <View style={[styles.modalHeader, noPadding && { padding: 24, paddingBottom: 0 }]}>
              {icon && <Icon name={icon} size={20} color={COLORS.textDark} style={{ marginRight: 10 }} />}
              {title && <Text style={styles.modalTitle}>{title}</Text>}
            </View>
          )}

          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    color: COLORS.textDark,
    fontSize: 22,
    fontWeight: '800',
  },
});
