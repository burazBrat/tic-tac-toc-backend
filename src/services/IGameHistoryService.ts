import { IGame } from '../models/IGame';
import { IGameResult } from '../models/IGameResult';

export interface IGameHistoryService {
  getGameHistory(game: IGame): Promise<IGameResult>;
}
