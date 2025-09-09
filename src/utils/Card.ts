export interface Card {
  id: string;
  value: string;
  flipped: boolean;
  matched: boolean;
}

export const emojiSets = {
  easy: ['🍎', '🍊'],
  medium: ['🍎', '🍊', '🍇', '🍋', '🍉', '🍓', '🍒', '🍍'],
  hard: [
    '🍎', '🍊', '🍇', '🍋', '🍉', '🍓', '🍒', '🍍',
    '🥝', '🍈', '🍏', '🍐', '🍑', '🥭', '🍅', '🍆', '🌽', '🥕'
  ]
};

export const gridSizes = {
  easy: 2,
  medium: 4,
  hard: 6
};

export const initializeCards = (level: 'easy' | 'medium' | 'hard'): Card[] => {
  const size = gridSizes[level] || 4;
  const numPairs = (size * size) / 2;
  const cardValues = emojiSets[level].slice(0, numPairs);
  const pairedValues = [...cardValues, ...cardValues];
  const shuffledCards = pairedValues
    .map((value, index) => ({
      id: `${value}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      value,
      flipped: false,
      matched: false
    }))
    .sort(() => Math.random() - 0.5);
  return shuffledCards;
};
