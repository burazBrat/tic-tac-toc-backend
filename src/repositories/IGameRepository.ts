import { IGame } from "../models/IGame";
import { GameStateType } from "../models/GameStateType";
import { GameType } from "../models/GameType";

export interface IGameRepository {
  dbGetGame(gameId: string): Promise<IGame>

  dbCreateGame(gameId: string, state: GameStateType, type: GameType): Promise<IGame>

  dbUpdateGame(gameId: string, game: IGame | any): Promise<IGame>
}
