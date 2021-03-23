import { isEmpty, isEqual, random } from "lodash";
import { ApolloError, UserInputError, ValidationError } from "apollo-server-errors";
import { ALL_GAME_POSITIONS, WINNING_COMBINATIONS } from "../config/constants";
import { IMove } from "../models/IMove";
import { PlayerType } from "../models/PlayerType";
import { pubsub } from "../appbase/apolloExpress";
import { SubscriptionType } from "../models/SubscriptionType";
import { GameStateType } from "../models/GameStateType";
import { IGameResult } from "../models/IGameResult";
import { GameWinnerType } from "../models/GameWinnerType";
import { GameType } from "../models/GameType";
import { IGame } from "../models/IGame";
import { logger } from "../appbase/logger";
import { IGameRepository } from "../repositories/IGameRepository";
import { IMoveRepository } from "../repositories/IMoveRepository";
import { IMultiplayerGameStateRepository } from "../repositories/IMultiplayerGameStateRepository";

export class MoveService {

  private gameRepository: IGameRepository;
  private moveRepository: IMoveRepository;
  private multiplayerGameStateRepository: IMultiplayerGameStateRepository;


  constructor(gameRepository: IGameRepository, moveRepository: IMoveRepository, multiplayerGameStateRepository: IMultiplayerGameStateRepository) {
    this.gameRepository = gameRepository;
    this.moveRepository = moveRepository;
    this.multiplayerGameStateRepository = multiplayerGameStateRepository;
  }

  public async makeMove(move: IMove): Promise<IMove> {
    logger.debug("Call makeMove in MoveService.");

    const { gameId, position } = move;

    // ideally put in the interceptor or in the graphql validator
    if (!ALL_GAME_POSITIONS.includes(position)) throw new ValidationError("Position is out of range");

    const game = await this.gameRepository.dbGetGame(gameId);
    await this.validate(game, move);

    let madeMove: IMove;
    if (game.type === GameType.SINGLE) {
      madeMove = await this.singlePlayerMove(move);
    } else {
      madeMove = await this.multiplayerMove(move);
    }

    logger.debug("Exit from makeMove in MoveService.");
    return madeMove;
  }

  private async singlePlayerMove(move: IMove): Promise<IMove> {
    const { gameId, position } = move;

    await this.moveRepository.dbCreateMove(move);
    logger.info(`${PlayerType.X} player made move. GameId=${gameId}, Position=${position}`);
    await this.calculateMove(move);

    if ((await this.gameRepository.dbGetGame(gameId)).state === GameStateType.PLAYING) {
      const cpuMove = await this.createCPUMove(gameId);
      await this.moveRepository.dbCreateMove(cpuMove);
      logger.info(`CPU made move. GameId=${gameId}, Position=${cpuMove.position}`);
      await this.calculateMove(cpuMove);
    }

    return move;
  }

  private async multiplayerMove(move: IMove): Promise<IMove> {
    const { gameId, position, player } = move;

    if (![PlayerType.X, PlayerType.O].includes(player)) throw new UserInputError("Right player type isn't set to move");

    const multiplayerGameState = await this.multiplayerGameStateRepository.dbFindMultiplayerGameState({ gameId });
    const { turn } = multiplayerGameState;

    if (turn !== move.player) throw new ApolloError("Turn is on another player", "FAULTY_PLAYER_TURN");

    const nextTurn = move.player === PlayerType.X ? PlayerType.O : PlayerType.X;
    await this.multiplayerGameStateRepository.dbUpdateMultiplayerGameState(gameId, { turn: nextTurn });
    logger.info(`Multiplayer game turn is swapped. GameId=${gameId}, Turn=${nextTurn}`);

    logger.info(`${turn} player made move. GameId=${gameId}, Position=${position}`);
    await this.moveRepository.dbCreateMove(move);
    await this.calculateMove(move, GameType.MULTIPLAYER);

    return move;
  }

  private async validate(game: IGame, move: IMove): Promise<void> {
    const { gameId, position } = move;
    const { state } = game;


    if (state !== GameStateType.PLAYING) throw new ApolloError("Game isn't active", "GAME_ISN'T_ACTIVE");
    const isPositionAlreadyExists = !!(await this.moveRepository.dbFindMoveByPosition({ gameId, position }));
    if (isPositionAlreadyExists) throw new ApolloError("Position already exists in game", "POSITION_ALREADY_EXIST");
  }

  private async createCPUMove(gameId: string): Promise<IMove> {
    const usedPositions = await MoveService.getPositionFromMoves(await this.moveRepository.dbFindMoves(gameId));
    const freePositions = ALL_GAME_POSITIONS.filter((x) => !usedPositions.includes(x));
    const randomElement = freePositions[random(freePositions.length - 1)];
    return { gameId, position: randomElement, player: PlayerType.O };
  }

  private async checkWin(playerPositions: number[]): Promise<boolean> {
    return WINNING_COMBINATIONS.some(combination => {
      return combination.every(() => {
        return isEqual(combination.sort(), playerPositions.sort());
      });
    });
  }

  private async calculateMove(move: IMove, gameType: GameType = GameType.SINGLE): Promise<void> {
    const { gameId } = move;

    const moves = await this.moveRepository.dbFindMoves(gameId);

    const isXWin = await this.checkWin(await MoveService.getPositionFromMoves(await this.moveRepository.dbFindMovesByPlayer({
      gameId,
      player: PlayerType.X
    })));

    const isOWin = await this.checkWin(await MoveService.getPositionFromMoves(await this.moveRepository.dbFindMovesByPlayer({
      gameId,
      player: PlayerType.O
    })));

    const isDraw = moves.length === 9;

    if (isXWin) {
      const gameResult: IGameResult = {
        gameId,
        moves,
        state: GameStateType.FINISHED,
        winner: GameWinnerType.X
      };
      await this.closeGame(gameResult, gameType);
      return;
    }

    if (isOWin) {
      const gameResult: IGameResult = {
        gameId,
        moves,
        state: GameStateType.FINISHED,
        winner: GameWinnerType.O
      };
      await this.closeGame(gameResult, gameType);
      return;
    }

    if (isDraw) {
      const gameResult: IGameResult = {
        gameId,
        moves,
        state: GameStateType.FINISHED,
        winner: GameWinnerType.DRAW
      };
      await this.closeGame(gameResult, gameType);
      return;
    }

    await MoveService.resultPayload({ gameId, moves, state: GameStateType.PLAYING });
  }

  private async closeGame(gameResult: IGameResult, gameType: GameType): Promise<void> {
    const { gameId, winner } = gameResult;

    await MoveService.resultPayload(gameResult);

    await this.gameRepository.dbUpdateGame(gameId, { winner, state: GameStateType.FINISHED });
    logger.info(`Game is finished. GameId=${gameId}, Winner=${winner}`);

    if (gameType === GameType.MULTIPLAYER) {
      await this.multiplayerGameStateRepository.dbDeleteMultiplayerGameState(gameId);
      logger.debug(`Multiplayer game state is deleted. GameId=${gameId}`);
    }
  }

  private static async getPositionFromMoves(moves: IMove[]): Promise<number[]> {
    return (moves).map(move => move.position);
  }

  private static async resultPayload({ gameId, state, winner, moves }: IGameResult): Promise<void> {
    await pubsub.publish(SubscriptionType.GAME_RESULT, {
      gameResult: {
        gameId,
        state,
        winner,
        moves
      }
    });
  }
}
