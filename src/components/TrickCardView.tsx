import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { CardView } from '../components/CardView';
import { Card } from '../types';

interface TrickCardViewProps {
  card: Card;
  cardStyle: 'modern' | 'classic';
  // 'down' = opponent card falls from above, 'up' = my card rises from below
  direction: 'down' | 'up';
}

export const TrickCardView: React.FC<TrickCardViewProps> = ({ card, cardStyle, direction }) => {
  const translateY = useRef(new Animated.Value(direction === 'down' ? -120 : 120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    translateY.setValue(direction === 'down' ? -120 : 120);
    opacity.setValue(0);
    scale.setValue(0.7);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 340,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 340,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: false,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    >
      <CardView card={card} cardStyle={cardStyle} />
    </Animated.View>
  );
};
