import { GameStateType } from './GameStateType';
import { GameType } from './GameType';
import { GameWinnerType } from './GameWinnerType';

export interface IGame {
  gameId: string,
  type: GameType,
  state: GameStateType,
  winner: GameWinnerType,
}
