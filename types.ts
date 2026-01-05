
export interface Point {
  x: number;
  y: number;
}

export interface Path {
  points: Point[];
  color: string;
  id: string;
}

export interface Dancer extends Path {
  danceStyle: string;
  personality: string;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  speed: number;
  bounceHeight: number;
}

export enum GameState {
  DRAWING = 'DRAWING',
  PARTY = 'PARTY'
}
