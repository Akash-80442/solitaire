import { Suit, Card } from '../types';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export const DECK_MAP: Record<Suit, string[]> = {
  spades:   ['', '🂡', '🂢', '🂣', '🂤', '🂥', '🂦', '🂧', '🂨', '🂩', '🂪', '🂫', '🂭', '🂮'],
  hearts:   ['', '🂱', '🂲', '🂳', '🂴', '🂵', '🂶', '🂷', '🂸', '🂹', '🂺', '🂻', '🂽', '🂾'],
  diamonds: ['', '🃁', '🃂', '🃃', '🃄', '🃅', '🃆', '🃇', '🃈', '🃉', '🃊', '🃋', '🃍', '🃎'],
  clubs:    ['', '🃑', '🃒', '🃓', '🃔', '🃕', '🃖', '🃗', '🃘', '🃙', '🃚', '🃛', '🃝', '🃞'],
};

export const getUnicodeCard = (card: Card | null): string => {
  if (!card) {return '';}
  if (!card.isFaceUp) {return '🂠';}
  return DECK_MAP[card.suit][card.rank];
};

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    const color = (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `${suit}-${rank}`, suit, rank, color, isFaceUp: false });
    }
  });
  return deck;
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const seededRandom = (seed: number) => {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

export const shuffleArraySeeded = <T,>(array: T[], seedStr: string): T[] => {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed += seedStr.charCodeAt(i);
  }
  const random = seededRandom(seed);
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
