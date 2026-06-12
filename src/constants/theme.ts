import { StyleSheet } from 'react-native';

export const COLORS = {
  // Theme Backgrounds
  primaryBg: '#0F172A', 
  sevenEightBg: '#0F172A', 
  freeCellBg: '#0F172A', 

  // Modals & Panels
  paperPanel: 'rgba(30, 41, 59, 0.95)',
  modalOverlay: 'rgba(0,0,0,0.7)',
  modalContentDark: '#1F2937',

  // UI Elements
  primary: '#06B6D4', // Cyan
  danger: '#EF4444',
  warning: '#F59E0B',

  // Text Colors
  textLight: '#F8FAFC',
  textMuted: '#94A3B8',
  textDark: '#F8FAFC', // Redirecting old dark text to light since panels are now dark
  textDarkMuted: '#CBD5E1', 
};

export const COMMON_STYLES = StyleSheet.create({
  paperPanel: {
    backgroundColor: COLORS.paperPanel,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
