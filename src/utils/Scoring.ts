export interface Score {
  moves: number;
  time: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Hiscore {
  easy: Score | null;
  medium: Score | null;
  hard: Score | null;
}