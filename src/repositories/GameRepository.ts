import mongoose, { Document, Schema } from "mongoose";
import { get, isEmpty } from "lodash";
import { IGame } from "../models/IGame";
import { IGameRepository } from "./IGameRepository";
import { logger } from "../appbase/logger";
import { ApolloError } from "apollo-server-errors";
import { GameStateType } from "../models/GameStateType";
import { GameType } from "../models/GameType";

const gameSchema = new Schema({
  gameId: String,
  type: {
    type: String,
    enum: ["SINGLE", "MULTIPLAYER"],
    default: "SINGLE"
  },
  state: {
    type: String,
    enum: ["CREATED", "WAITING_FOR_SECOND_PLAYER", "PLAYING", "FINISHED"],
    default: "CREATED"
  },
  winner: {
    type: String || null,
    enum: ["X", "O", null],
    default: null
  }
});

interface IGameModel extends IGame, Document {
}

const gameModel = mongoose.model<IGameModel>("games", gameSchema);

export class GameRepository implements IGameRepository {

  public async dbGetGame(gameId: string): Promise<IGame> {
    logger.debug("Try get game from db.");

    const game: IGame = await GameRepository.getGame(gameId);
    if (isEmpty(game)) throw new ApolloError("Game not found", "GAME_NOT_FOUND");

    logger.debug(`Return game from db. GameId=${game.gameId}`);
    return game;
  }

  public async dbCreateGame(gameId: string, state: GameStateType, type: GameType): Promise<IGame> {
    logger.debug("Try create game in db.");

    const exist: IGame = await GameRepository.getGame(gameId);
    if (!isEmpty(exist)) throw new ApolloError("Game already exists", "GAME_ALREADY_EXIST");

    const game: IGame = await GameRepository.getObject(await gameModel.create({ gameId, state, type }));

    logger.debug(`Return created game from db. GameId=${game.gameId}`);
    return game;
  }

  public async dbUpdateGame(gameId: string, game: IGame | any): Promise<IGame> {
    logger.debug("Try update game in db.");

    const updatedGame: IGame = await GameRepository.getObject(await gameModel.findOneAndUpdate({ gameId }, game, { new: true }));

    logger.debug(`Return updated game from db. GameId=${updatedGame.gameId}`);
    return updatedGame;
  }

  private static async getGame(gameId: string): Promise<IGame> {
    return await GameRepository.getObject(await gameModel.findOne({ gameId }));
  }

  private static async getObject(dbGame: IGameModel | null) {
    return get(dbGame, "_doc");
  }
}
