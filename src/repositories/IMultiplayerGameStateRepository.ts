import { IMove } from "../models/IMove";
import { PlayerType } from "../models/PlayerType";
import { IMultiplayerGameState } from "../models/IMultiplayerGameState";

export interface IMultiplayerGameStateRepository {
  dbCreateMultiplayerGameState(multiplayerGameState: IMultiplayerGameState): Promise<IMultiplayerGameState>


  dbFindMultiplayerGameState({ gameId }: { gameId: string }): Promise<IMultiplayerGameState>


  dbUpdateMultiplayerGameState(gameId: string, { turn }: { turn: PlayerType }): Promise<IMultiplayerGameState>


  dbDeleteMultiplayerGameState(gameId: string): void
}
