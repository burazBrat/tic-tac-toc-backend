import { IGame } from "../models/IGame";

export interface IGameService {
  createGame(game: IGame): Promise<IGame>;

  joinGame(game: IGame): Promise<IGame>;
}

