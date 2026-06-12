import { Card, Location, Suit } from '../types';

export const validateMove = (
  movingCards: Card[],
  target: Location,
  foundations: Record<Suit, Card[]>,
  tableaus: Card[][]
): boolean => {
  if (movingCards.length === 0) {return false;}
  const baseCard = movingCards[0];

  if (target.type === 'foundation') {
    if (movingCards.length > 1) {return false;}
    const f = foundations[target.suit];
    if (baseCard.suit !== target.suit) {return false;}
    if (f.length === 0) {return baseCard.rank === 1;}
    return baseCard.rank === f[f.length - 1].rank + 1;
  } else if (target.type === 'tableau') {
    const t = tableaus[target.col];
    if (t.length === 0) {return baseCard.rank === 13;}
    const topCard = t[t.length - 1];
    return baseCard.color !== topCard.color && baseCard.rank === topCard.rank - 1;
  }
  return false;
};
