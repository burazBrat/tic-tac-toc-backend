import { PlayerType } from './PlayerType';

export interface IMove {
  player: PlayerType,
  position: number,
  gameId: string,
}
