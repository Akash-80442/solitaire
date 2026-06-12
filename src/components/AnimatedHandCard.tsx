import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { CardView } from '../components/CardView';
import { Card } from '../types';

interface AnimatedHandCardProps {
  c: Card;
  i: number;
  total: number;
  disabled: boolean;
  valid: boolean;
  playFn: (id: string) => void;
  isMyTurn: boolean;
  phase: string;
  cardStyle: 'modern' | 'classic';
}

const CARD_SCALE = 1.4;

export const AnimatedHandCard: React.FC<AnimatedHandCardProps> = ({
  c,
  i,
  total,
  disabled,
  valid,
  playFn,
  isMyTurn,
  phase,
  cardStyle,
}) => {
  const entranceY = useRef(new Animated.Value(300)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  // nudge up slightly on play, then fade — no pixel-hunting
  const playNudgeY = useRef(new Animated.Value(0)).current;
  const playOpacity = useRef(new Animated.Value(1)).current;
  const hasPlayed = useRef(false);

  useEffect(() => {
    entranceY.setValue(300);
    entranceOpacity.setValue(0);
    dragY.setValue(0);
    playNudgeY.setValue(0);
    playOpacity.setValue(1);
    hasPlayed.current = false;

    Animated.parallel([
      Animated.timing(entranceY, {
        toValue: 0,
        duration: 480,
        delay: i * 75,
        easing: Easing.out(Easing.back(1.3)),
        useNativeDriver: false,
      }),
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 300,
        delay: i * 75,
        useNativeDriver: false,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id]);

  const triggerPlay = () => {
    if (hasPlayed.current || disabled) {return;}
    hasPlayed.current = true;
    // nudge card up by 60px then immediately fade out
    // the trick zone shows the real card via myPlay state
    Animated.parallel([
      Animated.timing(playNudgeY, {
        toValue: -60,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(playOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(() => playFn(c.id));
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, gs) =>
        !disabled && gs.dy < -6 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_e, gs) => {
        if (gs.dy < 0) {dragY.setValue(gs.dy);}
      },
      onPanResponderRelease: (_e, gs) => {
        if (gs.dy < -80) {
          triggerPlay();
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            tension: 80,
            friction: 7,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, {
          toValue: 0,
          tension: 80,
          friction: 7,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const centerIdx = (total - 1) / 2;
  const rotateDeg = (i - centerIdx) * 4;
  const arcY = Math.abs(i - centerIdx) * 4;
  const liftY = valid && isMyTurn && phase === 'PLAYING' ? -18 : 0;

  // disabled opacity: multiply into entranceOpacity target
  const stateOpacity = (() => {
    if (!valid && isMyTurn && phase === 'PLAYING') {return 0.5;}
    if (!isMyTurn && phase === 'PLAYING') {return 0.9;}
    return 1;
  })();

  // combine all opacities: entrance fade-in * disabled dimming * play fade-out
  const combinedOpacity = Animated.multiply(
    entranceOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0, stateOpacity],
    }),
    playOpacity
  );

  const totalY = Animated.add(
    Animated.add(entranceY, dragY),
    playNudgeY
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        marginLeft: i === 0 ? 0 : -35,
        zIndex: 10 + i,
        opacity: combinedOpacity,
        transform: [
          { translateY: arcY + liftY },
          { translateY: totalY },
          { rotate: `${rotateDeg}deg` },
          { scale: CARD_SCALE },
        ],
        shadowColor: '#000',
        shadowOffset: { width: -3, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
        elevation: 8 + i,
      }}
    >
      <TouchableOpacity
        onPress={triggerPlay}
        activeOpacity={0.85}
        disabled={disabled}
      >
        <CardView card={c} cardStyle={cardStyle} />
      </TouchableOpacity>
    </Animated.View>
  );
};
