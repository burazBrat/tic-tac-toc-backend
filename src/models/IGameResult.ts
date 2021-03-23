import { GameStateType } from './GameStateType';
import { IMove } from './IMove';
import { GameWinnerType } from './GameWinnerType';

export interface IGameResult {
  gameId: string,
  state?: GameStateType,
  winner?: GameWinnerType,
  moves: IMove[] | any[],
}
