import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const safeWidth = width > 0 ? width : 400;
export const cardWidth = Math.floor((safeWidth - 50) / 7);
export const cardHeight = Math.floor(cardWidth * 1.45);
