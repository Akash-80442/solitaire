import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Animated, PanResponder } from 'react-native';
import { Card, Location } from '../types';
import { CardView } from './CardView';
import { cardHeight } from '../constants/layout';

type DraggableStackProps = {
  cards: Card[];
  loc: Location;
  isStacked?: boolean;
  stackIndex: number;
  onDrop: (sourceLoc: Location, pageX: number, pageY: number) => boolean;
  onLocationTap: (loc: Location) => void;
  onError?: () => void;
  hintedCardIds?: string[];
  selectedCardId?: string | null;
  cardStyle?: 'classic' | 'modern';
  children?: React.ReactNode;
};

export const DraggableStack = ({ cards, loc, isStacked, children, stackIndex, onDrop, onLocationTap, onError, hintedCardIds = [], selectedCardId = null, cardStyle = 'modern' }: DraggableStackProps) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);

  const onDropRef = useRef(onDrop);
  const onLocationTapRef = useRef(onLocationTap);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onDropRef.current = onDrop;
    onLocationTapRef.current = onLocationTap;
    onErrorRef.current = onError;
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setIsDragging(true),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        setIsDragging(false);
        const isTap = Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5;
        if (isTap) {
          onLocationTapRef.current(loc);
          return;
        }

        const success = onDropRef.current(loc, e.nativeEvent.pageX, e.nativeEvent.pageY);
        if (!success) {
          if (onErrorRef.current) {onErrorRef.current();}
          Animated.sequence([
            Animated.timing(pan, { toValue: { x: 4, y: 0 }, duration: 40, useNativeDriver: false }),
            Animated.timing(pan, { toValue: { x: -4, y: 0 }, duration: 40, useNativeDriver: false }),
            Animated.timing(pan, { toValue: { x: 4, y: 0 }, duration: 40, useNativeDriver: false }),
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
          ]).start();
        } else {
          pan.setValue({ x: 0, y: 0 });
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        isStacked ? styles.tableauCardStacked : null,
        isDragging ? { zIndex: 9999, elevation: 9999 } : { zIndex: stackIndex, elevation: stackIndex },
        { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDragging ? 0.5 : 0.2, shadowRadius: isDragging ? 5 : 1 },
        { transform: pan.getTranslateTransform() },
      ]}
    >
      <CardView
        card={cards[0]}
        isHinted={hintedCardIds.includes(cards[0].id)}
        isSelected={selectedCardId === cards[0].id}
        cardStyle={cardStyle}
      />
      {children}
    </Animated.View>
  );
};

export const DraggableTail = ({
  cards,
  index,
  colIndex,
  onDrop,
  onLocationTap,
  onError,
  hintedCardIds = [],
  selectedCardId = null,
  cardStyle = 'modern',
}: {
  cards: Card[];
  index: number;
  colIndex: number;
  onDrop: (sourceLoc: Location, pageX: number, pageY: number) => boolean;
  onLocationTap: (loc: Location) => void;
  onError?: () => void;
  hintedCardIds?: string[];
  selectedCardId?: string | null;
  cardStyle?: 'classic' | 'modern';
}): React.ReactElement | null => {
  if (index >= cards.length) {return null;}
  return (
    <DraggableStack
      key={cards[index].id}
      cards={cards.slice(index)}
      loc={{ type: 'tableau', col: colIndex, row: index }}
      isStacked={index > 0}
      stackIndex={index + 1}
      onDrop={onDrop}
      onLocationTap={onLocationTap}
      onError={onError}
      hintedCardIds={hintedCardIds}
      selectedCardId={selectedCardId}
      cardStyle={cardStyle}
    >
      {DraggableTail({ cards, index: index + 1, colIndex, onDrop, onLocationTap, onError, hintedCardIds, selectedCardId, cardStyle })}
    </DraggableStack>
  );
};

const styles = StyleSheet.create({
  tableauCardStacked: {
    marginTop: Math.floor(-cardHeight * 0.8),
  },
});
