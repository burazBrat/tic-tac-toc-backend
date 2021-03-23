import { IMove } from "../models/IMove";
import { PlayerType } from "../models/PlayerType";

export interface IMoveRepository {
  dbCreateMove(move: IMove): Promise<IMove>

  dbFindMoves(gameId: string): Promise<IMove[]>

  dbFindMoveByPosition({ gameId, position }: { gameId: string, position: number }): Promise<IMove>

  dbFindMovesByPlayer({ gameId, player }: { gameId: string, player: PlayerType }): Promise<IMove[]>
}
