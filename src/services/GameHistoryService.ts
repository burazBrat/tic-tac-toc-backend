import { isEmpty } from "lodash";
import { ApolloError } from "apollo-server-errors";
import { IGame } from "../models/IGame";
import { GameStateType } from "../models/GameStateType";
import { logger } from "../appbase/logger";
import { IGameResult } from "../models/IGameResult";
import { IGameHistoryService } from "./IGameHistoryService";
import { IGameRepository } from "../repositories/IGameRepository";
import { IMoveRepository } from "../repositories/IMoveRepository";

export class GameHistoryService implements IGameHistoryService {

  private gameRepository: IGameRepository;
  private moveRepository: IMoveRepository;

  constructor(gameRepository: IGameRepository, moveRepository: IMoveRepository) {
    this.gameRepository = gameRepository;
    this.moveRepository = moveRepository;
  }

  public async getGameHistory(game: IGame): Promise<IGameResult> {
    logger.debug(`Call getGameHistory in ${GameHistoryService}.`);

    const { gameId } = game;

    const exist: IGame = await this.gameRepository.dbGetGame(gameId);

    if (isEmpty(exist)) throw new ApolloError("Game not found", "GAME_NOT_FOUND");
    const { state, winner } = exist;
    if (state !== GameStateType.FINISHED) throw new ApolloError("Game isn't finished yer", "GAME_ISN'T_FINISHED");

    const gameResult: IGameResult = { gameId, winner, moves: await this.moveRepository.dbFindMoves(gameId) };
    logger.info(`User get game history. GameId=${gameId}`);

    logger.debug(`Exit from getGameHistory in in ${GameHistoryService}.`);
    return gameResult;
  }
}
