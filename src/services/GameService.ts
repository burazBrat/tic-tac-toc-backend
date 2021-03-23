import { ApolloError, UserInputError } from "apollo-server-errors";
import { IGame } from "../models/IGame";
import { GameStateType } from "../models/GameStateType";
import { PlayerType } from "../models/PlayerType";
import { GameType } from "../models/GameType";
import { logger } from "../appbase/logger";
import { IGameRepository } from "../repositories/IGameRepository";
import { IGameService } from "./IGameService";
import { IMultiplayerGameStateRepository } from "../repositories/IMultiplayerGameStateRepository";

export class GameService implements IGameService {

  private gameRepository: IGameRepository;
  private multiplayerGameStateRepository: IMultiplayerGameStateRepository;

  constructor(gameRepository: IGameRepository, multiplayerGameStateRepository: IMultiplayerGameStateRepository) {
    this.gameRepository = gameRepository;
    this.multiplayerGameStateRepository = multiplayerGameStateRepository;
  }

  public async createGame(game: IGame): Promise<IGame> {
    logger.debug("Call createGame in GameService.");

    const { gameId, type } = game;

    // ideally put in the interceptor or in the graphql validator
    if (![GameType.SINGLE, GameType.MULTIPLAYER].includes(type)) throw new UserInputError("Right property type isn't set to game");

    const gameType = type === GameType.SINGLE ? GameStateType.PLAYING : GameStateType.WAITING_FOR_SECOND_PLAYER;
    const createdGame: IGame = await this.gameRepository.dbCreateGame(gameId, gameType, type);
    logger.info(`Player X created game. GameId=${createdGame.gameId}`);

    logger.debug("Exit from createGame in GameService.");
    return createdGame;
  }

  public async joinGame(game: IGame): Promise<IGame> {
    logger.debug("Call joinGame in GameService.");

    const { gameId } = game;

    const { state }: IGame = await this.gameRepository.dbGetGame(gameId);
    if (state !== GameStateType.WAITING_FOR_SECOND_PLAYER) throw new ApolloError("Game isn't available", "GAME_ISN'T_AVAILABLE");

    await this.multiplayerGameStateRepository.dbCreateMultiplayerGameState({ gameId, turn: PlayerType.X });
    logger.debug(`Multiplayer game state is created. GameId=${gameId}`);

    const updatedGame: IGame = await this.gameRepository.dbUpdateGame(gameId, { state: GameStateType.PLAYING });
    if (updatedGame) logger.info(`O player joined the game. GameId=${updatedGame.gameId}`);

    logger.debug("Exit from joinGame in GameService.");
    return updatedGame;
  }
}
