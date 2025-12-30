
export enum GameState {
  START_SCREEN = 'START_SCREEN',
  COUNTDOWN = 'COUNTDOWN',
  RACING = 'RACING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

export interface GameStats {
  speed: number;
  streak: number;
  speedMultiplier: number;
}
