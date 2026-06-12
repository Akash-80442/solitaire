export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type Card = {
  id: string;
  suit: Suit;
  rank: number; // 1 to 13 (Ace=1, King=13)
  color: 'black' | 'red';
  isFaceUp: boolean;
};

export type Location =
  | { type: 'tableau'; col: number; row?: number }
  | { type: 'foundation'; suit: Suit }
  | { type: 'waste' }
  | { type: 'stock' }
  | { type: 'freecell'; index: number };

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
