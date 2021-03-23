import { PlayerType } from "./PlayerType";

export interface IMultiplayerGameState {
    turn: PlayerType,
    gameId: string,
}
